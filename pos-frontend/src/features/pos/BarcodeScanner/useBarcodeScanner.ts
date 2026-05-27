import { useEffect, useRef } from 'react';

interface UseBarcodeScannerProps {
  onScan: (barcode: string) => void;
  enabled?: boolean;
}

/**
 * Synthesizes a sweet, high-pitched supermarket-style scanner beep using the Web Audio API.
 * This is 100% native, zero-dependency, and doesn't require downloading audio assets.
 */
export const playScannerBeep = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    
    // Resume context if suspended (browser security policies)
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(1350, audioCtx.currentTime); // 1350Hz sweet spot
    
    // Quick gain ramp up and down to prevent clicky sound artifacts
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.08); // 80ms beep
  } catch (error) {
    console.warn('Fallo al reproducir el beep del escáner (AudioContext no soportado o bloqueado):', error);
  }
};

/**
 * React hook that listens globally to keyboard inputs and intercepts fast keystroke
 * sequences (typical of physical USB/Bluetooth barcode scanners) ending in Enter.
 */
export const useBarcodeScanner = ({ onScan, enabled = true }: UseBarcodeScannerProps) => {
  const bufferRef = useRef<string[]>([]);
  const lastKeyTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Ignore keys like Shift, Control, Alt, CapsLock, Escape, Arrow keys, etc.
      if (e.key.length > 1 && e.key !== 'Enter') {
        return;
      }

      // 2. Ignore if focused in a form input/select/textarea other than the search box
      const activeEl = document.activeElement;
      if (activeEl) {
        const tagName = activeEl.tagName;
        const id = activeEl.id;
        const isInput = tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT';
        const isSearchInput = id === 'product-search-input';

        if (isInput && !isSearchInput) {
          // Clear buffer to prevent accidental scans when typing client details
          bufferRef.current = [];
          return;
        }
      }

      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTimeRef.current;
      lastKeyTimeRef.current = currentTime;

      // If typing speed is slower than 50ms per key, it is likely a human typing.
      // Clear the buffer.
      if (timeDiff > 50 && bufferRef.current.length > 0) {
        bufferRef.current = [];
      }

      if (e.key === 'Enter') {
        // If Enter is pressed and we accumulated at least 3 characters at fast speed
        if (bufferRef.current.length >= 3) {
          e.preventDefault();
          e.stopPropagation();
          const barcode = bufferRef.current.join('');
          bufferRef.current = [];
          
          playScannerBeep();
          onScan(barcode);
        } else {
          bufferRef.current = [];
        }
      } else {
        bufferRef.current.push(e.key);
      }
    };

    // Use capturing phase (true) to intercept keystrokes before they reach focused fields if necessary
    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [onScan, enabled]);
};
