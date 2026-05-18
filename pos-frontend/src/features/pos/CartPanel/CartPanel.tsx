import React, { useState, useEffect } from 'react';
import { useCartStore } from '../../../adapters/state/cartStore';
import { useInventoryStore } from '../../../adapters/state/inventoryStore';
import { useSalesStore } from '../../../adapters/state/salesStore';
import { useUsersStore } from '../../../adapters/state/usersStore';

export const CartPanel: React.FC = () => {
  const { carts, activeCartId, actions } = useCartStore();
  const { products } = useInventoryStore();
  const { addSale } = useSalesStore();
  const cart = activeCartId ? carts[activeCartId] : null;

  const [showCheckout, setShowCheckout] = useState(false);

  // Escuchar atajos de teclado globales de la pantalla cajero
  useEffect(() => {
    const onClear = () => actions.clearCart();
    const onCheckout = () => {
      if (cart && cart.items.length > 0) setShowCheckout(true);
    };
    window.addEventListener('pos:clearCart', onClear);
    window.addEventListener('pos:checkout', onCheckout);
    return () => {
      window.removeEventListener('pos:clearCart', onClear);
      window.removeEventListener('pos:checkout', onCheckout);
    };
  }, [actions, cart]);
  const [buyerId, setBuyerId] = useState('');
  const [sellerId, setSellerId] = useState('cajero_1');
  const [cashReceived, setCashReceived] = useState('');

  if (!cart) return <div className="p-8 text-center glass rounded-2xl">Cargando carrito...</div>;

  const handleIncrement = (productId: string, currentQuantity: number) => {
    const product = products.find(p => p.id === productId);
    if (product && currentQuantity + 1 <= product.stock) {
      actions.updateQuantity(productId, currentQuantity + 1);
    } else if (product) {
      alert(`¡No puedes agregar más! Solo hay ${product.stock} unidades disponibles.`);
    }
  };

  const subtotal = cart.items.reduce((sum, item) => sum + (((item.unitPrice as any)?.amount || 0) * item.quantity), 0);
  const tax = Math.round(subtotal * 0.19); // 19% IVA Colombia
  const total = subtotal + tax;

  const formatCOP = (val: number) => new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(val);

  const handleFinishSale = () => {
    // 1. Deduct stock from global inventory
    cart.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        useInventoryStore.getState().updateProduct({
          ...product,
          stock: product.stock - item.quantity
        });
      }
    });

    // 2. Save the sale locally
    addSale({
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      buyerId: buyerId || 'Consumidor Final',
      sellerId: sellerId,
      items: [...cart.items],
      subtotal,
      tax,
      total,
      cashReceived: Number(cashReceived)
    });

    alert(`¡Venta Exitosa!\nTotal: ${formatCOP(total)}\nCliente: ${buyerId || 'Consumidor Final'}\nVendedor: ${sellerId}`);

    actions.clearCart();
    setShowCheckout(false);
    setBuyerId('');
    setCashReceived('');
  };

  const change = Number(cashReceived) - total;

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200 relative">
      <div className="bg-gray-900 text-white p-6 flex justify-between items-center">
        <div>
          <h2 className="font-black text-xl tracking-tight">Carrito</h2>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Terminal #001</p>
        </div>
        <button 
          onClick={() => actions.clearCart()} 
          className="px-3 py-1 text-xs font-bold bg-white/10 hover:bg-white/20 rounded-full transition-colors"
        >
          Vaciar
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-gray-50">
        {cart.items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <p className="font-bold text-sm text-gray-500">El carrito está vacío</p>
          </div>
        ) : (
          cart.items.map(item => (
            <div key={item.id} className="flex justify-between items-center group bg-white p-3 rounded-xl shadow-sm border border-gray-100">
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 text-sm">{item.productName}</h4>
                <div className="text-gray-500 font-medium text-xs">{formatCOP((item.unitPrice as any)?.amount || 0)} c/u</div>
              </div>
              <div className="flex items-center gap-3 bg-gray-100 p-1 rounded-full">
                <button 
                  className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all font-bold text-gray-700"
                  onClick={() => actions.updateQuantity(item.productId, item.quantity - 1)}
                >-</button>
                <span className="w-4 text-center font-black text-xs text-gray-900">{item.quantity}</span>
                <button 
                  className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all font-bold text-gray-700"
                  onClick={() => handleIncrement(item.productId, item.quantity)}
                >+</button>
              </div>
              <div className="w-20 text-right font-black text-sm text-gray-900 ml-2">
                {formatCOP(((item.unitPrice as any)?.amount || 0) * item.quantity)}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-white p-8 border-t border-gray-200">
        <div className="flex justify-between text-gray-500 text-sm mb-2 font-medium">
          <span>Subtotal</span>
          <span className="text-gray-900">{formatCOP(subtotal)}</span>
        </div>
        <div className="flex justify-between text-gray-500 text-sm mb-6 font-medium">
          <span>IVA (19%)</span>
          <span className="text-gray-900">{formatCOP(tax)}</span>
        </div>
        <div className="flex justify-between items-end mb-8">
          <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Total a pagar</span>
          <span className="text-4xl font-black text-gray-900 tracking-tighter">
            {formatCOP(total)}
          </span>
        </div>
        <button 
          onClick={() => setShowCheckout(true)}
          className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl text-lg shadow-lg disabled:bg-gray-300 disabled:text-gray-500 transition-all"
          disabled={cart.items.length === 0}
        >
          COBRAR {cart.items.length > 0 && formatCOP(total)}
        </button>
      </div>

      {showCheckout && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex flex-col p-8 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-black text-gray-900">Finalizar Venta</h3>
            <button onClick={() => setShowCheckout(false)} className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500 hover:bg-gray-300">X</button>
          </div>

          <div className="flex-1 flex flex-col gap-6">
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-center">
              <span className="text-blue-500 font-bold text-xs uppercase tracking-widest block mb-2">Total a Pagar</span>
              <span className="text-5xl font-black text-blue-700">{formatCOP(total)}</span>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Cédula del Cliente (Opcional)</label>
              <input 
                type="text" 
                placeholder="Ej: 1020304050" 
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
                value={buyerId}
                onChange={(e) => setBuyerId(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Atendido por</label>
              <select 
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium bg-white"
                value={sellerId}
                onChange={(e) => setSellerId(e.target.value)}
              >
                <option value="">Selecciona un cajero...</option>
                {useUsersStore.getState().cashiers.filter(c => c.isActive).map(cashier => (
                  <option key={cashier.id} value={cashier.name}>{cashier.name} (CC: {cashier.cedula})</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Efectivo Recibido (COP)</label>
              <input 
                type="number" 
                placeholder="Ej: 50000" 
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 font-black text-xl"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
              />
            </div>

            {Number(cashReceived) > 0 && (
              <div className={`p-4 rounded-xl font-bold flex justify-between ${change >= 0 ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                <span>{change >= 0 ? 'Cambio a devolver:' : 'Falta dinero:'}</span>
                <span className="text-xl">{formatCOP(Math.abs(change))}</span>
              </div>
            )}
          </div>

          <button 
            onClick={handleFinishSale}
            disabled={Number(cashReceived) < total}
            className="w-full mt-6 py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl text-lg shadow-lg disabled:bg-gray-300 disabled:text-gray-500 transition-all"
          >
            CONFIRMAR VENTA
          </button>
        </div>
      )}
    </div>
  );
};
