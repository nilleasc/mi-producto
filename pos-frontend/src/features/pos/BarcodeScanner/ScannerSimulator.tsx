import React, { useState } from 'react';
import { useInventoryStore } from '../../../adapters/state/inventoryStore';

interface ScannerSimulatorProps {
  onSimulateScanComplete?: (barcode: string) => void;
}

export const ScannerSimulator: React.FC<ScannerSimulatorProps> = ({ onSimulateScanComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentScanningSku, setCurrentScanningSku] = useState<string | null>(null);
  const { products } = useInventoryStore();

  const handleSimulateScan = async (sku: string) => {
    if (isSimulating) return;
    setIsSimulating(true);
    setCurrentScanningSku(sku);

    // Filter non-alphanumeric chars or just simulate whatever string we have
    const characters = sku.split('');

    try {
      // Simulate physical scanner speed (e.g., 8ms between keypresses)
      for (const char of characters) {
        const e = new KeyboardEvent('keydown', {
          key: char,
          bubbles: true,
          cancelable: true,
        });
        window.dispatchEvent(e);
        await new Promise((r) => setTimeout(r, 8));
      }

      // Finally, send the 'Enter' keypress which physical scanners send at the end
      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      });
      window.dispatchEvent(enterEvent);
      
      onSimulateScanComplete?.(sku);
    } catch (err) {
      console.error('Error simulating scan:', err);
    } finally {
      setTimeout(() => {
        setIsSimulating(false);
        setCurrentScanningSku(null);
      }, 300); // Keep visual state briefly for feedback
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-5 py-3.5 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer font-bold text-sm tracking-wide
          ${isOpen 
            ? 'bg-rose-600 hover:bg-rose-700 text-white' 
            : 'bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30'
          }`}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        {isOpen ? (
          <>
            <span>Cerrar Simulador</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0a8 8 0 11-16 0 8 8 0 0116 0z" />
            </svg>
            <span>Simulador de Escáner</span>
          </>
        )}
      </button>

      {/* Simulator Interface Card */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-slate-900/95 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-5 shadow-2xl transform transition-all duration-300 ease-out origin-bottom-right">
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-800">
            <div>
              <h4 className="text-white font-extrabold text-sm uppercase tracking-wider flex items-center gap-1.5">
                <span>⚡</span> Probador de Códigos
              </h4>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Emula la velocidad de lectura física USB</p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
              Listo
            </span>
          </div>

          {/* Catalog list for simulated scans */}
          <div className="max-h-64 overflow-y-auto pr-1 flex flex-col gap-2.5 scrollbar-thin scrollbar-thumb-slate-700">
            {products.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No hay productos en inventario para simular.</p>
            ) : (
              products.map((product) => {
                const isScanningThis = currentScanningSku === product.sku;
                return (
                  <div
                    key={product.id}
                    className={`flex items-center justify-between p-3 rounded-2xl transition-all duration-200 border
                      ${isScanningThis 
                        ? 'bg-emerald-500/15 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                        : 'bg-slate-800/40 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700'
                      }`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="text-xs font-bold text-white truncate">{product.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                        SKU: <span className="text-emerald-400 font-semibold">{product.sku}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => handleSimulateScan(product.sku)}
                      disabled={isSimulating || product.stock <= 0}
                      className={`px-3 py-1.5 rounded-xl font-black text-[10px] tracking-wider uppercase transition-all duration-200 cursor-pointer flex items-center gap-1
                        ${product.stock <= 0
                          ? 'bg-slate-800 text-slate-600 border border-slate-800 cursor-not-allowed'
                          : isScanningThis
                          ? 'bg-emerald-500 text-slate-900 border border-emerald-400 scale-95'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-slate-900 border border-emerald-500 shadow-lg hover:shadow-emerald-500/20'
                        }`}
                    >
                      {product.stock <= 0 ? (
                        'Agotado'
                      ) : isScanningThis ? (
                        <>
                          <svg className="animate-spin h-3 w-3 text-slate-900" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Lector</span>
                        </>
                      ) : (
                        <>
                          <span>Escanear</span>
                          <span>⚡</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer warning */}
          <div className="mt-4 pt-3 border-t border-slate-800 text-[9px] text-slate-400 leading-relaxed">
            💡 <strong className="text-slate-200">Tip de desarrollo:</strong> El simulador inyecta pulsaciones de teclado rápidas para validar que el hook del lector funcione sin enfocar la caja de texto. ¡Pruébalo!
          </div>
        </div>
      )}
    </div>
  );
};
