import React, { useState, useEffect } from 'react';
import { useCartStore } from '../../../adapters/state/cartStore';
import { useInventoryStore } from '../../../adapters/state/inventoryStore';
import { useSalesStore } from '../../../adapters/state/salesStore';
import { useUsersStore } from '../../../adapters/state/usersStore';
import { apiClient } from '../../../infrastructure/http/apiClient';
import { ReceiptPreview, SaleData } from '../ReceiptPreview/ReceiptPreview';

export const CartPanel: React.FC = () => {
  const { carts, activeCartId, actions } = useCartStore();
  const { products } = useInventoryStore();
  const { addSale } = useSalesStore();
  const cart = activeCartId ? carts[activeCartId] : null;

  const [showCheckout, setShowCheckout] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSale, setCompletedSale] = useState<SaleData | null>(null);

  const VALID_COUPONS: Record<string, number> = { 'DESC10': 0.10 };

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (VALID_COUPONS[code] !== undefined) { setAppliedCoupon({ code, discount: VALID_COUPONS[code] }); setCouponError(''); }
    else { setAppliedCoupon(null); setCouponError('Cupón inválido. Intenta con DESC10.'); }
  };

  const handleRemoveCoupon = () => { setAppliedCoupon(null); setCouponCode(''); setCouponError(''); };

  useEffect(() => { actions.clearCart(); }, []);

  useEffect(() => {
    const onClear = () => actions.clearCart();
    const onCheckout = () => { if (cart && cart.items.length > 0) setShowCheckout(true); };
    window.addEventListener('pos:clearCart', onClear);
    window.addEventListener('pos:checkout', onCheckout);
    return () => { window.removeEventListener('pos:clearCart', onClear); window.removeEventListener('pos:checkout', onCheckout); };
  }, [actions, cart]);

  const [buyerId, setBuyerId] = useState('');
  const activeCashiers = useUsersStore.getState().cashiers.filter(c => c.isActive);
  const [sellerId, setSellerId] = useState(activeCashiers.length > 0 ? activeCashiers[0].name : '');
  const [cashReceived, setCashReceived] = useState('');

  if (!cart) return <div className="p-8 text-center text-slate-400 text-sm">Cargando...</div>;

  const handleIncrement = (productId: string, currentQuantity: number) => {
    const product = products.find(p => p.id === productId);
    if (product && currentQuantity + 1 <= product.stock) actions.updateQuantity(productId, currentQuantity + 1);
    else if (product) alert(`Solo hay ${product.stock} unidades disponibles.`);
  };

  const subtotal = cart.items.reduce((sum, item) => sum + (((item.unitPrice as any)?.amount || 0) * item.quantity), 0);
  const discountAmount = appliedCoupon ? Math.round(subtotal * appliedCoupon.discount) : 0;
  const subtotalAfterDiscount = subtotal - discountAmount;
  const tax = Math.round(subtotalAfterDiscount * 0.19);
  const total = subtotalAfterDiscount + tax;

  const formatCOP = (val: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val);

  const handleFinishSale = async () => {
    setIsSubmitting(true);
    try {
      const saleResponse = await apiClient.post('/api/sales', { terminalId: 'TERM-001', cashierId: sellerId || 'cajero_1', customerId: buyerId || '' });
      const saleId = saleResponse.id;
      for (const item of cart.items) {
        await apiClient.post(`/api/sales/${saleId}/items`, { productId: item.productId, quantity: item.quantity });
      }
      await apiClient.post(`/api/sales/${saleId}/checkout`, { paymentType: 'CASH', amountReceived: Number(cashReceived), discount: discountAmount > 0 ? discountAmount : undefined });
      cart.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) useInventoryStore.getState().updateProduct({ ...product, stock: product.stock - item.quantity });
      });
      const newSale: SaleData = {
        id: Math.random().toString(36).substr(2, 9), date: new Date().toISOString(),
        buyerId: buyerId || 'Consumidor Final', sellerId,
        items: cart.items.map(i => ({ productId: i.productId, productName: i.productName, quantity: i.quantity, unitPrice: (i.unitPrice as any)?.amount || 0 })),
        subtotal, discount: discountAmount, tax, total, cashReceived: Number(cashReceived),
      };
      addSale(newSale);
      setCompletedSale(newSale);
    } catch (error: any) {
      alert(`❌ Error: ${error?.message || 'Error desconocido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseReceipt = () => {
    actions.clearCart(); setShowCheckout(false); setBuyerId(''); setCashReceived(''); handleRemoveCoupon(); setCompletedSale(null);
  };

  const change = Number(cashReceived) - total;

  return (
    <div className="flex flex-col h-full overflow-hidden relative">

      {/* ═══ Cabecera con gradiente ═══ */}
      <div className="flex-shrink-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white px-5 pt-5 pb-4 rounded-t-2xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
            </div>
            <div>
              <h2 className="font-black text-base tracking-tight leading-none">Carrito de Compras</h2>
              <p className="text-[10px] text-orange-400 uppercase tracking-widest font-bold mt-0.5">Terminal #001</p>
            </div>
          </div>
          <button
            onClick={() => actions.clearCart()}
            title="Vaciar carrito (F3)"
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-red-500/80 text-white/60 hover:text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
        {/* Contador de ítems */}
        {cart.items.length > 0 && (
          <div className="flex items-center gap-2 mt-1">
            <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-orange-400 rounded-full transition-all duration-500" style={{ width: `${Math.min(cart.items.length * 15, 100)}%` }} />
            </div>
            <span className="text-[10px] text-white/50 font-bold">{cart.items.length} {cart.items.length === 1 ? 'ítem' : 'ítems'}</span>
          </div>
        )}
      </div>

      {/* ═══ Lista de ítems ═══ */}
      <div className="flex-1 overflow-y-auto bg-white min-h-0">
        {cart.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 py-10">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center">
                <span className="text-orange-500 text-sm">0</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-slate-500">Tu carrito está vacío</p>
              <p className="text-xs text-slate-400 mt-1 max-w-[180px]">Busca productos y agrégalos para comenzar</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {cart.items.map((item, index) => (
              <div key={item.id} className="flex items-center gap-3 px-4 py-3 hover:bg-orange-50/30 transition-colors group">
                {/* Numerador */}
                <span className="text-[10px] font-bold text-slate-300 w-4 text-center flex-shrink-0">{index + 1}</span>
                {/* Icono */}
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-sm shadow-orange-200">
                  {item.productName.charAt(0).toUpperCase()}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 text-xs truncate group-hover:text-orange-700 transition-colors">{item.productName}</p>
                  <p className="text-slate-400 text-[10px] font-medium mt-0.5">{formatCOP((item.unitPrice as any)?.amount || 0)} × {item.quantity}</p>
                </div>
                {/* Controles cantidad */}
                <div className="flex items-center bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                  <button
                    className="w-7 h-7 flex items-center justify-center hover:bg-red-50 text-slate-400 hover:text-red-500 font-bold text-sm transition-all border-r border-slate-100"
                    onClick={() => actions.updateQuantity(item.productId, item.quantity - 1)}
                  >−</button>
                  <span className="w-7 text-center font-black text-xs text-slate-900">{item.quantity}</span>
                  <button
                    className="w-7 h-7 flex items-center justify-center hover:bg-green-50 text-slate-400 hover:text-green-600 font-bold text-sm transition-all border-l border-slate-100"
                    onClick={() => handleIncrement(item.productId, item.quantity)}
                  >+</button>
                </div>
                {/* Total */}
                <div className="w-[72px] text-right font-black text-xs text-slate-900 flex-shrink-0 tabular-nums">
                  {formatCOP(((item.unitPrice as any)?.amount || 0) * item.quantity)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══ Sección financiera ═══ */}
      <div className="flex-shrink-0 bg-slate-50 border-t border-slate-100 px-5 pt-4 pb-4">

        {/* Cupón */}
        <div className="mb-3">
          {appliedCoupon ? (
            <div className="flex items-center justify-between bg-emerald-50 rounded-xl px-3.5 py-2.5 border border-emerald-200">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-emerald-700 font-bold text-xs">{appliedCoupon.code} <span className="font-medium text-emerald-600">· −{(appliedCoupon.discount * 100).toFixed(0)}%</span></span>
              </div>
              <button onClick={handleRemoveCoupon} className="text-[10px] text-red-400 font-bold hover:text-red-600 transition-colors cursor-pointer uppercase tracking-wide">Quitar</button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="🎟️ Código de cupón"
                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-orange-200 focus:border-orange-300 outline-none text-slate-800 placeholder-slate-400 transition-all"
                value={couponCode}
                onChange={(e) => { setCouponCode(e.target.value); setCouponError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
              />
              <button
                onClick={handleApplyCoupon}
                className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-600 text-xs font-bold rounded-lg transition-all cursor-pointer"
              >Aplicar</button>
            </div>
          )}
          {couponError && <p className="text-red-400 text-[10px] mt-1 ml-1 font-medium">{couponError}</p>}
        </div>

        {/* Totales */}
        <div className="space-y-1 mb-3 text-xs">
          <div className="flex justify-between text-slate-500 font-medium">
            <span>Subtotal</span><span className="text-slate-700 font-semibold tabular-nums">{formatCOP(subtotal)}</span>
          </div>
          {appliedCoupon && (
            <div className="flex justify-between text-emerald-600 font-bold">
              <span>Descuento ({(appliedCoupon.discount * 100).toFixed(0)}%)</span>
              <span className="tabular-nums">− {formatCOP(discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-500 font-medium">
            <span>IVA (19%)</span><span className="text-slate-700 font-semibold tabular-nums">{formatCOP(tax)}</span>
          </div>
        </div>

        {/* Total destacado */}
        <div className="flex items-center justify-between mb-4 bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl px-4 py-3 text-white">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-orange-500 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-bold text-xs uppercase tracking-wider text-white/70">Total</span>
          </div>
          <span className="text-xl font-black tracking-tight tabular-nums">{formatCOP(total)}</span>
        </div>

        {/* Botón COBRAR */}
        <button
          onClick={() => setShowCheckout(true)}
          disabled={cart.items.length === 0}
          className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black rounded-xl text-sm shadow-lg shadow-orange-500/25 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 disabled:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          COBRAR {cart.items.length > 0 && formatCOP(total)}
          <kbd className="ml-0.5 px-1.5 py-0.5 bg-white/20 rounded text-[9px] font-mono">F4</kbd>
        </button>
      </div>

      {/* ═══ Modal Checkout ═══ */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Header checkout */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 px-6 py-5 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-black">Finalizar Venta</h3>
                  <p className="text-white/50 text-[10px] uppercase tracking-widest font-bold mt-0.5">Confirma los datos de pago</p>
                </div>
                <button onClick={() => setShowCheckout(false)} className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white/60 hover:text-white transition-all cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {/* Total en header */}
              <div className="mt-4 bg-white/10 rounded-xl px-4 py-3 backdrop-blur-sm flex items-center justify-between">
                <span className="text-white/60 text-xs font-bold uppercase tracking-wider">Total a Pagar</span>
                <div className="text-right">
                  {appliedCoupon && (
                    <div className="flex items-center gap-2 justify-end mb-0.5">
                      <span className="line-through text-white/40 text-xs">{formatCOP(subtotal + Math.round(subtotal * 0.19))}</span>
                      <span className="bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">−{(appliedCoupon.discount * 100).toFixed(0)}%</span>
                    </div>
                  )}
                  <span className="text-2xl font-black tracking-tight">{formatCOP(total)}</span>
                </div>
              </div>
            </div>

            {/* Body checkout */}
            <div className="p-6 flex flex-col gap-4 max-h-[50vh] overflow-y-auto">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide ml-1 flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  Cédula del Cliente (Opcional)
                </label>
                <input type="text" placeholder="Ej: 1020304050"
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-200 focus:border-orange-400 focus:bg-white text-slate-900 text-sm font-medium placeholder-slate-400 outline-none transition-all"
                  value={buyerId} onChange={(e) => setBuyerId(e.target.value)} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide ml-1 flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Atendido por
                </label>
                <select
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-200 focus:border-orange-400 focus:bg-white text-slate-900 text-sm font-medium appearance-none outline-none transition-all"
                  value={sellerId} onChange={(e) => setSellerId(e.target.value)}>
                  <option value="">Selecciona un cajero...</option>
                  {useUsersStore.getState().cashiers.filter(c => c.isActive).map(cashier => (
                    <option key={cashier.id} value={cashier.name}>{cashier.name} (CC: {cashier.cedula})</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide ml-1 flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  Efectivo Recibido (COP)
                </label>
                <input type="number" placeholder="Ej: 50000"
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-200 focus:border-orange-400 focus:bg-white text-slate-900 font-black text-xl placeholder-slate-300 outline-none transition-all tabular-nums"
                  value={cashReceived} onChange={(e) => setCashReceived(e.target.value)} />
              </div>

              {Number(cashReceived) > 0 && (
                <div className={`p-4 rounded-xl font-bold flex items-center justify-between text-sm ${change >= 0 ? 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200' : 'bg-gradient-to-r from-red-50 to-pink-50 text-red-600 border border-red-200'}`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${change >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}>
                      {change >= 0 ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.068 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                      )}
                    </div>
                    <span className="text-xs font-medium">{change >= 0 ? 'Cambio:' : 'Falta:'}</span>
                  </div>
                  <span className="text-lg font-black tabular-nums">{formatCOP(Math.abs(change))}</span>
                </div>
              )}
            </div>

            {/* Footer checkout */}
            <div className="px-6 pb-6">
              <button
                onClick={handleFinishSale}
                disabled={Number(cashReceived) < total || isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black rounded-xl text-sm shadow-lg shadow-orange-500/25 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 disabled:shadow-none transition-all flex justify-center items-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <><svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>PROCESANDO...</>
                ) : (
                  <><svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>CONFIRMAR VENTA</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {completedSale && <ReceiptPreview sale={completedSale} onClose={handleCloseReceipt} />}
    </div>
  );
};
