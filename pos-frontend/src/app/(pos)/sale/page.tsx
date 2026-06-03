'use client';

import React, { useEffect, useState } from 'react';
import { ProductGrid } from '../../../features/pos/ProductGrid/ProductGrid';
import { CartPanel } from '../../../features/pos/CartPanel/CartPanel';
import { useCartStore } from '../../../adapters/state/cartStore';
import { useInventoryStore } from '../../../adapters/state/inventoryStore';
import { Product } from '../../../core/entities/Product';
import { useBarcodeScanner } from '../../../features/pos/BarcodeScanner/useBarcodeScanner';

const CASHIER_SHORTCUTS = [
  { key: 'F2', description: 'Enfocar buscador' },
  { key: 'F3', description: 'Vaciar carrito' },
  { key: 'F4', description: 'Cobrar' },
  { key: 'Esc', description: 'Cancelar / cerrar' },
  { key: '↑ ↓', description: 'Navegar sugerencias' },
  { key: 'Tab', description: 'Primera sugerencia' },
  { key: '↵', description: 'Confirmar selección' },
];

export default function SalePage() {
  const { actions } = useCartStore();
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [isScanningLaser, setIsScanningLaser] = useState(false);
  const [scanToast, setScanToast] = useState<{ show: boolean; productName: string } | null>(null);

  useEffect(() => {
    useInventoryStore.getState().fetchProducts();
  }, []);

  const fireCheckout = () => window.dispatchEvent(new CustomEvent('pos:checkout'));
  const fireClearCart = () => window.dispatchEvent(new CustomEvent('pos:clearCart'));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const isSearchInput = (e.target as HTMLElement).id === 'product-search-input';
      if (e.key === 'F2') { e.preventDefault(); document.getElementById('product-search-input')?.focus(); return; }
      if ((tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') && !isSearchInput) return;
      if (e.key === 'F3') { e.preventDefault(); fireClearCart(); return; }
      if (e.key === 'F4') { e.preventDefault(); fireCheckout(); return; }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAddToCart = (product: Product, quantity: number) => {
    const state = useCartStore.getState();
    const cart = state.carts[state.activeCartId || 'default'];
    const existingItem = cart?.items?.find((i: any) => i.productId === product.id);
    const currentQty = existingItem ? existingItem.quantity : 0;
    if (currentQty + quantity <= product.stock) {
      actions.addItem(product, quantity);
    } else {
      alert(`¡Solo hay ${product.stock} unidades de ${product.name} en stock.`);
    }
  };

  const { products } = useInventoryStore();

  const handleGlobalBarcodeScan = (barcode: string) => {
    const product = products.find((p) => String(p.sku).trim() === barcode.trim());
    if (product) {
      if (product.stock > 0) {
        const state = useCartStore.getState();
        const cart = state.carts[state.activeCartId || 'default'];
        const existingItem = cart?.items?.find((i: any) => i.productId === product.id);
        const currentQty = existingItem ? existingItem.quantity : 0;
        if (currentQty + 1 <= product.stock) {
          actions.addItem(product, 1);
          setIsScanningLaser(true);
          setScanToast({ show: true, productName: product.name });
          setTimeout(() => setIsScanningLaser(false), 600);
          setTimeout(() => setScanToast(null), 2500);
        } else {
          alert(`¡Solo hay ${product.stock} unidades de ${product.name} en stock.`);
        }
      } else {
        alert(`${product.name} está agotado.`);
      }
    } else {
      alert(`Código "${barcode}" no encontrado.`);
    }
  };

  useBarcodeScanner({ onScan: handleGlobalBarcodeScan });

  return (
    <div className="flex h-full w-full overflow-hidden" style={{ background: '#f1f5f9' }}>

      {/* ══════════════════════════════════════════════
          SIDEBAR FIJO — top bar horizontal de marca
      ══════════════════════════════════════════════ */}
      {/* Ahora el sidebar es una franja izquierda fija, no flotante */}
      <aside className="w-[72px] flex flex-col items-center py-5 gap-5 flex-shrink-0 bg-white border-r border-slate-100 shadow-[1px_0_0_#f1f5f9]">
        {/* Logo */}
        <div className="w-10 h-10 bg-orange-600 rounded-2xl flex items-center justify-center font-black text-sm text-white shadow-md shadow-orange-200 select-none">
          POS
        </div>

        <div className="w-8 h-px bg-slate-100" />

        {/* Botón Teclas */}
        <div className="relative w-full flex flex-col items-center">
          <button
            onClick={() => setShortcutsOpen((o) => !o)}
            title="Atajos de teclado"
            className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer
              ${shortcutsOpen
                ? 'bg-orange-600 text-white shadow-md shadow-orange-200'
                : 'hover:bg-slate-50 text-slate-400 hover:text-slate-600'}`}
            aria-label="Atajos de teclado"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-[7px] font-black uppercase tracking-widest leading-none">Teclas</span>
          </button>

          {/* Panel de atajos — sale hacia la derecha del sidebar */}
          {shortcutsOpen && (
            <div className="absolute left-[68px] top-0 z-50 w-64 bg-white rounded-2xl shadow-[0_8px_40px_-8px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-50">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-slate-800 text-sm font-bold">Atajos de teclado</span>
                </div>
              </div>
              <ul className="py-2">
                {CASHIER_SHORTCUTS.map((s, i) => (
                  <li key={i} className="flex items-center justify-between px-5 py-2.5 hover:bg-slate-50 transition-colors">
                    <span className="text-slate-600 text-xs font-medium">{s.description}</span>
                    <kbd className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[10px] font-mono text-orange-600 shadow-sm">{s.key}</kbd>
                  </li>
                ))}
              </ul>
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
                <p className="text-slate-400 text-[10px] text-center">
                  <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-500 font-mono text-[9px] shadow-sm">F2</kbd>{' '}
                  para enfocar el buscador en cualquier momento
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ══════════════════════════════════════════════
          ÁREA PRINCIPAL
      ══════════════════════════════════════════════ */}
      <div className="flex flex-1 gap-4 p-4 overflow-hidden">

        {/* Zona central: buscador + catálogo */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden min-w-0">
          <ProductGrid onAddToCart={handleAddToCart} />
        </div>

        {/* Panel derecho: carrito */}
        <div className="w-[380px] flex-shrink-0 overflow-hidden">
          <CartPanel />
        </div>
      </div>

      {/* Overlay Láser */}
      {isScanningLaser && (
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
          <div className="absolute inset-0 bg-emerald-500/8" />
          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-400 shadow-[0_0_20px_#10b981,0_0_40px_#10b981] animate-laser-sweep" />
        </div>
      )}

      {/* Toast de escaneo */}
      {scanToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none">
          <div className="bg-white border border-emerald-100 px-5 py-3.5 rounded-2xl shadow-[0_12px_40px_-8px_rgba(16,185,129,0.2)] flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-emerald-200">✓</div>
            <div className="text-sm font-semibold text-slate-800">
              Escaneado: <span className="text-emerald-600 font-black">{scanToast.productName}</span>
              <span className="ml-2 bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">+1</span>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes laserSweep {
          0% { transform: translateY(0); opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        .animate-laser-sweep { animation: laserSweep 0.6s ease forwards; }
      `}</style>
    </div>
  );
}
