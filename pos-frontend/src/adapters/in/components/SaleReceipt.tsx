'use client';

import { SaleResponse } from '../../../domain/sale/Sale';

interface SaleReceiptProps {
  venta: SaleResponse;
  onNewSale: () => void;
}

export function SaleReceipt({ venta, onNewSale }: SaleReceiptProps) {
  const fecha = new Date(venta.timestamp);

  return (
    <div className="bg-white rounded-lg shadow-xl p-8 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="inline-block bg-green-100 rounded-full p-3 mb-4">
          <svg
            className="h-12 w-12 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">¡Venta Exitosa!</h2>
      </div>

      <div className="border-t border-b border-gray-200 py-4 mb-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">ID de Venta:</span>
          <span className="font-mono font-semibold">{venta.ventaId}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Fecha:</span>
          <span className="font-medium">{fecha.toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Hora:</span>
          <span className="font-medium">{fecha.toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-3">Productos:</h3>
        <div className="space-y-2">
          {venta.items.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <div className="flex-1">
                <p className="font-medium">{item.productoId}</p>
                <p className="text-gray-500 text-xs">
                  {item.cantidad} × ${item.precioUnitario.toFixed(2)}
                </p>
              </div>
              <span className="font-semibold">${item.subtotal.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-300 pt-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-gray-800">TOTAL:</span>
          <span className="text-2xl font-bold text-green-600">
            ${venta.totalVenta.toFixed(2)}
          </span>
        </div>
      </div>

      <button
        onClick={onNewSale}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
      >
        Nueva Venta
      </button>
    </div>
  );
}
