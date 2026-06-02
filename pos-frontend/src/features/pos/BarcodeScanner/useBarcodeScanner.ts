import { useEffect } from 'react';

interface UseBarcodeScannerProps {
  onScan: (barcode: string) => void;
}

export function useBarcodeScanner({ onScan }: UseBarcodeScannerProps) {
  useEffect(() => {
    let barcode = '';
    let timeout: NodeJS.Timeout | null = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';

      // Ignorar teclas especiales que no son Enter
      if (e.key.length > 1 && e.key !== 'Enter') return;

      if (e.key === 'Enter') {
        if (barcode.length > 2 && !isInput) {
          onScan(barcode);
          e.preventDefault();
        }
        barcode = '';
        if (timeout) clearTimeout(timeout);
        return;
      }

      // Si no estamos en un input, acumulamos los caracteres rápidos (como lo hace el lector)
      if (!isInput) {
        barcode += e.key;
        if (timeout) clearTimeout(timeout);
        
        // El timeout asume que si dejas de "escribir" por 100ms, no era un escáner
        timeout = setTimeout(() => {
          barcode = '';
        }, 100);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timeout) clearTimeout(timeout);
    };
  }, [onScan]);
}
