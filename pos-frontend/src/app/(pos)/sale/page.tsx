'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ProductGrid } from '../../../features/pos/ProductGrid/ProductGrid';
import { CartPanel } from '../../../features/pos/CartPanel/CartPanel';
import { useCartStore } from '../../../adapters/state/cartStore';
import { useInventoryStore } from '../../../adapters/state/inventoryStore';
import { Product } from '../../../core/entities/Product';

// ─── Definición de atajos ────────────────────────────────────────────────────
const CASHIER_SHORTCUTS = [
  { key: 'F2', description: 'Enfocar buscador' },
  { key: 'F3', description: 'Vaciar carrito' },
  { key: 'F4', description: 'Cobrar / pagar' },
  { key: 'Esc', description: 'Cancelar / cerrar modal' },
  { key: '↑ ↓', description: 'Navegar sugerencias' },
  { key: 'Tab', description: 'Seleccionar primera sugerencia' },
  { key: '↵', description: 'Confirmar selección' },
];

export default function SalePage() {
  const { actions, carts, activeCartId } = useCartStore();
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const shortcutBtnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // ─── Cargar catálogo desde la API ──────────────────────────────────────
  useEffect(() => {
    useInventoryStore.getState().fetchProducts();
  }, []);

  // ─── Acciones desde el carrito para disparar desde atajos ───────────────
  // Necesitamos acceso a la función cobrar del CartPanel; la coordinamos
  // con un evento de ventana personalizado.
  const fireCheckout = () => window.dispatchEvent(new CustomEvent('pos:checkout'));
  const fireClearCart = () => window.dispatchEvent(new CustomEvent('pos:clearCart'));

  // ─── Atajos globales de la pantalla de cajero ────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // No activar atajos si el foco está en un input normal (excepto el de búsqueda)
      const tag = (e.target as HTMLElement).tagName;
      const isSearchInput = (e.target as HTMLElement).id === 'product-search-input';

      if (e.key === 'F2') {
        e.preventDefault();
        document.getElementById('product-search-input')?.focus();
        return;
      }

      // F3 y F4 no se disparan si hay un input de texto activo que no sea la búsqueda
      if ((tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') && !isSearchInput) return;

      if (e.key === 'F3') {
        e.preventDefault();
        fireClearCart();
        return;
      }

      if (e.key === 'F4') {
        e.preventDefault();
        fireCheckout();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ─── Cerrar panel al hacer clic fuera ───────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        !shortcutBtnRef.current?.contains(e.target as Node)
      ) {
        setShortcutsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddToCart = (product: Product, quantity: number) => {
    const state = useCartStore.getState();
    const cart = state.carts[state.activeCartId || 'default'];
    const existingItem = cart?.items?.find((i) => i.productId === product.id);
    const currentQty = existingItem ? existingItem.quantity : 0;

    if (currentQty + quantity <= product.stock) {
      actions.addItem(product, quantity);
    } else {
      alert(`¡No puedes agregar más! Solo hay ${product.stock} unidades de ${product.name} en stock.`);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* ── Sidebar ── */}
      <div className="w-20 bg-gray-800 text-white flex flex-col items-center py-4 gap-4 relative">
        <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-xl">
          POS
        </div>

        {/* Botón de atajos en el sidebar */}
        <button
          ref={shortcutBtnRef}
          onClick={() => setShortcutsOpen((o) => !o)}
          title="Atajos de teclado"
          className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer mt-auto mb-4
            ${shortcutsOpen ? 'bg-blue-500 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
          aria-label="Atajos de teclado"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="text-[8px] font-bold uppercase tracking-wide leading-none">Teclas</span>
        </button>

        {/* Panel desplegable de atajos — sale hacia la derecha del sidebar */}
        {shortcutsOpen && (
          <div
            ref={panelRef}
            className="absolute left-20 bottom-4 z-50 w-72 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Cabecera */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-white text-sm font-semibold">Atajos de teclado</span>
              </div>
              <button
                onClick={() => setShortcutsOpen(false)}
                className="text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
                aria-label="Cerrar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Lista de atajos */}
            <ul className="py-2">
              {CASHIER_SHORTCUTS.map((s, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-800 transition-colors"
                >
                  <span className="text-gray-300 text-sm">{s.description}</span>
                  <kbd className="px-2 py-1 bg-gray-700 border border-gray-600 rounded-lg text-[11px] font-mono text-gray-200 tracking-wide shadow-sm">
                    {s.key}
                  </kbd>
                </li>
              ))}
            </ul>

            {/* Pie */}
            <div className="px-4 py-3 bg-gray-800 border-t border-gray-700">
              <p className="text-gray-500 text-[10px] text-center">
                Presiona <kbd className="px-1 bg-gray-700 border border-gray-600 rounded text-gray-300 font-mono">F2</kbd> en cualquier momento para buscar
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Área principal ── */}
      <div className="flex-1 flex p-6 gap-6">
        {/* Izquierda: Buscador + Grid */}
        <div className="flex-1 overflow-hidden">
          <ProductGrid onAddToCart={handleAddToCart} />
        </div>

        {/* Derecha: Carrito */}
        <div className="w-96 flex-shrink-0">
          <CartPanel />
        </div>
      </div>
    </div>
  );
}
