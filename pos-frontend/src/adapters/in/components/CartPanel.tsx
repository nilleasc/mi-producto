'use client';

import { Cart } from '../../../domain/cart/Cart';
import { CartItem } from './CartItem';
import { EmptyCart } from './EmptyState';

interface CartPanelProps {
  cart: Cart;
  onUpdateQuantity: (productoId: string, cantidad: number) => void;
  onRemoveItem: (productoId: string) => void;
  onUpdatePriceOverride?: (productoId: string, precioOverride: number, autorizadoPor: string) => void;
}

export function CartPanel({ cart, onUpdateQuantity, onRemoveItem, onUpdatePriceOverride }: CartPanelProps) {
  const isEmpty = cart.items.length === 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Carrito de Compras</h2>

      {isEmpty ? (
        <EmptyCart />
      ) : (
        <>
          <div className="flex-1 overflow-y-auto space-y-3 mb-4">
            {cart.items.map((item) => (
              <CartItem
                key={item.productoId}
                item={item}
                onUpdateQuantity={onUpdateQuantity}
                onRemove={onRemoveItem}
                onUpdatePriceOverride={onUpdatePriceOverride}
              />
            ))}
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Items:</span>
              <span className="font-medium">{cart.items.length}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Unidades:</span>
              <span className="font-medium">
                {cart.items.reduce((acc, item) => acc + item.cantidad, 0)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-300">
              <span className="text-xl font-bold text-gray-800">TOTAL:</span>
              <span className="text-2xl font-bold text-blue-600">
                ${cart.total.toFixed(2)}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
