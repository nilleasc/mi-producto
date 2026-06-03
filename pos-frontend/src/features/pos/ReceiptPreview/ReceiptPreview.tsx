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
  const dateObj = new Date(sale.date);
  const dateStr = dateObj.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = dateObj.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm print:bg-white print:p-0 print:block">
      <div className="bg-white w-full max-w-[420px] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] print:shadow-none print:w-[80mm] print:max-w-none print:rounded-none">

        {/* ═══ Header de la factura ═══ */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white px-6 pt-6 pb-5 flex-shrink-0 print:bg-white print:text-black relative overflow-hidden">
          {/* Patrón decorativo */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-orange-500/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center font-black text-lg text-white shadow-lg shadow-orange-500/30 print:bg-transparent print:text-black print:border-2 print:border-black print:shadow-none">
                POS
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight print:text-black">POS Nicolle</h2>
                <p className="text-white/50 text-[10px] uppercase tracking-widest font-bold print:text-gray-500">Comprobante de Venta</p>
              </div>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-3 backdrop-blur-sm print:bg-gray-100 print:border print:border-gray-200">
              <div className="grid grid-cols-2 gap-y-1.5 text-xs">
                <div>
                  <span className="text-white/40 font-medium text-[10px] print:text-gray-400">Ticket</span>
                  <p className="font-black text-white/90 print:text-black">#{sale.id.slice(0, 8).toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <span className="text-white/40 font-medium text-[10px] print:text-gray-400">Fecha</span>
                  <p className="font-bold text-white/90 print:text-black">{dateStr}</p>
                </div>
                <div>
                  <span className="text-white/40 font-medium text-[10px] print:text-gray-400">Cajero</span>
                  <p className="font-medium text-white/80 print:text-black">{sale.sellerId}</p>
                </div>
                <div className="text-right">
                  <span className="text-white/40 font-medium text-[10px] print:text-gray-400">Hora</span>
                  <p className="font-medium text-white/80 print:text-black">{timeStr}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ Body de la factura ═══ */}
        <div className="flex-1 overflow-y-auto px-6 py-5 print:overflow-visible print:px-4">

          {/* Cliente */}
          <div className="flex items-center gap-2.5 mb-5 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 print:border-gray-300">
            <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center print:bg-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Cliente</p>
              <p className="text-sm font-bold text-slate-800">{sale.buyerId || 'Consumidor Final'}</p>
            </div>
          </div>

          {/* Tabla de ítems */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-md bg-orange-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Detalle de productos</span>
              <span className="text-[10px] text-slate-400 font-medium">({sale.items.length})</span>
            </div>

            <div className="border border-slate-100 rounded-xl overflow-hidden print:border-gray-300">
              {/* Header tabla */}
              <div className="grid grid-cols-[40px_1fr_80px] bg-slate-50 px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider print:bg-gray-100">
                <span>Cant</span>
                <span>Producto</span>
                <span className="text-right">Total</span>
              </div>
              {/* Rows */}
              {sale.items.map((item, idx) => (
                <div key={idx} className={`grid grid-cols-[40px_1fr_80px] px-3 py-2.5 items-center text-sm ${idx < sale.items.length - 1 ? 'border-b border-slate-50 print:border-gray-200' : ''}`}>
                  <span className="w-6 h-6 rounded-md bg-orange-50 flex items-center justify-center text-orange-600 font-black text-xs print:bg-transparent print:border print:border-gray-300">{item.quantity}</span>
                  <div className="min-w-0 px-2">
                    <p className="font-bold text-slate-800 text-xs truncate">{item.productName}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{formatCOP(item.unitPrice)} c/u</p>
                  </div>
                  <span className="text-right font-black text-xs text-slate-900 tabular-nums">
                    {formatCOP(item.quantity * item.unitPrice)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Desglose financiero */}
          <div className="border border-slate-100 rounded-xl overflow-hidden mb-5 print:border-gray-300">
            <div className="px-4 py-3 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Subtotal</span>
                <span className="text-slate-800 font-semibold tabular-nums">{formatCOP(sale.subtotal)}</span>
              </div>
              {sale.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                    Descuento
                  </span>
                  <span className="tabular-nums">−{formatCOP(sale.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500 font-medium">
                <span>IVA (19%)</span>
                <span className="text-slate-800 font-semibold tabular-nums">{formatCOP(sale.tax)}</span>
              </div>
            </div>
            {/* Total row */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-3 flex justify-between items-center text-white">
              <span className="font-bold text-xs uppercase tracking-wider text-white/70">Total</span>
              <span className="text-xl font-black tracking-tight tabular-nums">{formatCOP(sale.total)}</span>
            </div>
          </div>

          {/* Pago */}
          <div className="bg-slate-50 rounded-xl px-4 py-3 space-y-2 mb-5 border border-slate-100 print:bg-gray-50 print:border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-5 rounded-md bg-green-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Información de Pago</span>
            </div>
            <div className="flex justify-between text-xs font-medium text-slate-600">
              <span>Efectivo recibido</span>
              <span className="font-bold text-slate-800 tabular-nums">{formatCOP(sale.cashReceived)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-emerald-600">Cambio devuelto</span>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-md bg-emerald-500 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <span className="text-base font-black text-emerald-700 tabular-nums">{formatCOP(Math.max(0, change))}</span>
              </div>
            </div>
          </div>

          {/* Mensaje de agradecimiento */}
          <div className="text-center py-3">
            <div className="inline-flex items-center gap-2 bg-orange-50 rounded-full px-4 py-2 border border-orange-100">
              <span className="text-orange-400 text-lg">✨</span>
              <span className="text-xs font-bold text-orange-600">¡Gracias por su compra!</span>
              <span className="text-orange-400 text-lg">✨</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-medium">Conserve este comprobante para cualquier reclamo</p>
            <p className="text-[10px] text-slate-300 mt-0.5">NIT: 900.123.456-7 · Tel: (123) 456-7890</p>
          </div>
        </div>

        {/* ═══ Botones de acción ═══ */}
        <div className="flex-shrink-0 p-5 bg-slate-50 border-t border-slate-100 flex gap-3 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 py-3.5 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nueva Venta
          </button>
        </div>
      </div>
    </div>
  );
};
