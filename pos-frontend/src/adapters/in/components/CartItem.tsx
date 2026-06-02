'use client';

import { CartItem as CartItemType } from '../../../domain/cart/CartItem';
import { usePriceOverride } from '../../../application/usePriceOverride';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (productoId: string, cantidad: number) => void;
  onRemove: (productoId: string) => void;
  onUpdatePriceOverride?: (productoId: string, precioOverride: number, autorizadoPor: string) => void;
}

export function CartItem({ item, onUpdateQuantity, onRemove, onUpdatePriceOverride }: CartItemProps) {
  const { umbralDescuento, overrideBajoUmbral } = usePriceOverride(
    item.productoId,
    item.precioOverride,
    item.precioOficial
  );

  const handleIncrement = () => {
    onUpdateQuantity(item.productoId, item.cantidad + 1);
  };

  const handleDecrement = () => {
    if (item.cantidad > 1) {
      onUpdateQuantity(item.productoId, item.cantidad - 1);
    }
  };

  return (
    <div className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow ${
      overrideBajoUmbral ? 'border-orange-400 bg-orange-50' : 'border-gray-200'
    }`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800">{item.nombreProducto}</h3>
          <p className="text-xs text-gray-500">{item.productoId}</p>
        </div>
        <button
          onClick={() => onRemove(item.productoId)}
          className="text-red-500 hover:text-red-700 text-sm font-medium"
          aria-label={`Eliminar ${item.nombreProducto}`}
        >
          ✕
        </button>
      </div>

      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600">Precio unitario:</span>
        <span className="font-medium text-gray-800">${item.precioOficial.toFixed(2)}</span>
      </div>

      {item.precioOverride && (
        <>
          <div className="flex items-center justify-between mb-2 text-orange-600">
            <span className="text-sm">Precio modificado:</span>
            <span className="font-medium">${item.precioOverride.toFixed(2)}</span>
          </div>
          
          {overrideBajoUmbral && (
            <div className="mb-2 p-2 bg-orange-100 border border-orange-300 rounded text-xs">
              <div className="flex items-center gap-1 text-orange-800">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Descuento mayor al 30%</span>
              </div>
              <p className="mt-1 text-orange-700">
                Umbral mínimo: ${umbralDescuento.toFixed(2)} (70% del precio oficial)
              </p>
            </div>
          )}
        </>
      )}

      {item.autorizadoPor && (
        <div className="text-xs text-gray-500 mb-2">
          Autorizado por: {item.autorizadoPor}
        </div>
      )}

      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600">Cantidad:</span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDecrement}
            disabled={item.cantidad <= 1}
            className="w-8 h-8 bg-gray-200 rounded-md hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
            aria-label="Disminuir cantidad"
          >
            −
          </button>
          <span className="w-12 text-center font-medium">{item.cantidad}</span>
          <button
            onClick={handleIncrement}
            className="w-8 h-8 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            aria-label="Aumentar cantidad"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
        <span className="font-semibold text-gray-700">Subtotal:</span>
        <span className="font-bold text-lg text-blue-600">${item.subtotal.toFixed(2)}</span>
      </div>

      {item.errorCodigo && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
          Error: {item.errorCodigo}
        </div>
      )}
    </div>
  );
}
