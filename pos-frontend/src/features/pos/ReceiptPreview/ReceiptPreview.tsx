import React from 'react';

export interface SaleData {
  id: string;
  date: string;
  buyerId?: string;
  sellerId: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
  }[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  cashReceived: number;
}

interface ReceiptPreviewProps {
  sale: SaleData;
  onClose: () => void;
}

export const ReceiptPreview: React.FC<ReceiptPreviewProps> = ({ sale, onClose }) => {
  const formatCOP = (val: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(val);

  const change = sale.cashReceived - sale.total;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm print:bg-white print:p-0 print:block">
      {/* Container - hide shadows/borders on print */}
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-full print:shadow-none print:w-[80mm] print:max-w-none print:rounded-none">
        
        {/* Receipt Header (Scrollable body) */}
        <div className="flex-1 overflow-y-auto p-6 pb-2 print:overflow-visible print:p-4" id="receipt-content">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gray-900 text-white rounded-2xl mx-auto flex items-center justify-center font-black text-2xl mb-3 print:bg-transparent print:text-black print:border-2 print:border-black print:rounded-full">
              POS
            </div>
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Mi Tienda Local</h2>
            <p className="text-sm text-gray-500 font-medium">NIT: 900.123.456-7</p>
            <p className="text-sm text-gray-500 font-medium">Calle Falsa 123, Ciudad</p>
            <p className="text-sm text-gray-500 font-medium">Tel: (123) 456-7890</p>
          </div>

          <div className="border-t-2 border-dashed border-gray-200 py-3 mb-3 text-sm font-medium text-gray-600 print:border-black">
            <div className="flex justify-between">
              <span>Ticket:</span>
              <span className="font-bold text-gray-900">#{sale.id.slice(0, 8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span>Fecha:</span>
              <span>{new Date(sale.date).toLocaleString('es-CO')}</span>
            </div>
            <div className="flex justify-between">
              <span>Cajero:</span>
              <span>{sale.sellerId}</span>
            </div>
            <div className="flex justify-between">
              <span>Cliente:</span>
              <span>{sale.buyerId || 'Consumidor Final'}</span>
            </div>
          </div>

          <div className="mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-dashed border-gray-200 text-left text-gray-500 print:border-black">
                  <th className="py-2 font-bold uppercase text-xs w-8">Cant</th>
                  <th className="py-2 font-bold uppercase text-xs">Desc</th>
                  <th className="py-2 font-bold uppercase text-xs text-right">Total</th>
                </tr>
              </thead>
              <tbody className="text-gray-800 font-medium">
                {sale.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-100 print:border-gray-300">
                    <td className="py-2 align-top">{item.quantity}</td>
                    <td className="py-2 leading-tight">
                      <div className="font-bold">{item.productName}</div>
                      <div className="text-xs text-gray-400">{formatCOP(item.unitPrice)} c/u</div>
                    </td>
                    <td className="py-2 text-right align-top font-bold">
                      {formatCOP(item.quantity * item.unitPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-1 text-sm text-gray-600 font-medium mb-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCOP(sale.subtotal)}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Descuento</span>
                <span>-{formatCOP(sale.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>IVA (19%)</span>
              <span>{formatCOP(sale.tax)}</span>
            </div>
            <div className="flex justify-between text-xl font-black text-gray-900 pt-2 border-t-2 border-dashed border-gray-200 print:border-black mt-2">
              <span>TOTAL</span>
              <span>{formatCOP(sale.total)}</span>
            </div>
          </div>

          <div className="border-t-2 border-dashed border-gray-200 py-3 mb-6 space-y-1 text-sm font-medium text-gray-600 print:border-black">
            <div className="flex justify-between">
              <span>Efectivo</span>
              <span>{formatCOP(sale.cashReceived)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900">
              <span>Cambio</span>
              <span>{formatCOP(Math.max(0, change))}</span>
            </div>
          </div>

          <div className="text-center text-xs font-medium text-gray-400 pb-4">
            ¡Gracias por su compra!<br />
            Conserve este recibo para reclamos.
          </div>
        </div>

        {/* Action Buttons - Hidden on Print */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-colors"
          >
            Nueva Venta
          </button>
        </div>
      </div>
    </div>
  );
};
