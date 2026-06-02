import React, { useState, useRef } from 'react';

export const ScannerSimulator: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const simulateScan = (barcode: string) => {
    if (!barcode.trim()) return;

    // Quitamos el foco del input para que el hook global pueda escuchar las teclas
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    document.body.focus();

    // Despachamos los eventos de teclado simulando la rapidez del escáner
    barcode.split('').forEach((char) => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: char, bubbles: true }));
    });
    
    // Finalizamos con Enter
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    
    setCode('');
    setOpen(false); // Ocultar después de escanear exitosamente para una experiencia más fluida
  };

  if (!open) {
    return (
      <button 
        onClick={() => {
          setOpen(true);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
        className="fixed bottom-4 right-4 bg-gray-900 text-white p-3 rounded-full shadow-2xl z-50 hover:bg-gray-800 transition-colors animate-bounce"
        title="Simular Lector Físico"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0a8 8 0 11-16 0 8 8 0 0116 0z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-2xl shadow-2xl z-50 border border-gray-200 flex flex-col gap-3 w-72">
      <div className="flex justify-between items-center">
        <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0a8 8 0 11-16 0 8 8 0 0116 0z" />
          </svg>
          Simulador de Lector
        </h4>
        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-900 font-bold px-2 py-1 bg-gray-100 rounded-md text-xs">Cerrar</button>
      </div>
      
      <p className="text-xs text-gray-500">Ingresa un código SKU para simular que fue leído por el láser.</p>
      
      <div className="flex gap-2">
        <input 
          ref={inputRef}
          type="text" 
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          placeholder="Ej: PAN-001"
          className="flex-1 border-2 border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-500 font-mono"
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              simulateScan(code);
            }
          }}
        />
        <button 
          onClick={() => simulateScan(code)}
          className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-md"
        >
          SIMULAR
        </button>
      </div>
      
      <div className="bg-gray-50 p-2 rounded-lg mt-1 border border-gray-100">
        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">SKUs de Prueba en Base de Datos:</p>
        <div className="flex gap-1 flex-wrap">
          <span onClick={() => setCode('PAN-001')} className="text-[10px] bg-white border border-gray-200 px-2 py-0.5 rounded cursor-pointer hover:border-blue-400 hover:text-blue-500">PAN-001</span>
          <span onClick={() => setCode('BEB-002')} className="text-[10px] bg-white border border-gray-200 px-2 py-0.5 rounded cursor-pointer hover:border-blue-400 hover:text-blue-500">BEB-002</span>
          <span onClick={() => setCode('LCT-001')} className="text-[10px] bg-white border border-gray-200 px-2 py-0.5 rounded cursor-pointer hover:border-blue-400 hover:text-blue-500">LCT-001</span>
        </div>
      </div>
    </div>
  );
};
