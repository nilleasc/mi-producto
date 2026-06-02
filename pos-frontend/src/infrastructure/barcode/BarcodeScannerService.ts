/**
 * Servicio de lectura de código de barras
 * 
 * Detecta entrada rápida de teclado (scanner) y la diferencia
 * de entrada manual del usuario.
 */

type BarcodeHandler = (barcode: string) => void;

interface BarcodeScannerConfig {
  /** Tiempo máximo entre caracteres para considerar scanner (ms) */
  maxTimeBetweenChars: number;
  
  /** Longitud mínima del código de barras */
  minLength: number;
  
  /** Longitud máxima del código de barras */
  maxLength: number;
  
  /** Prefijo esperado (opcional) */
  prefix?: string;
  
  /** Sufijo esperado (opcional, ej: Enter) */
  suffix?: string;
}

const DEFAULT_CONFIG: BarcodeScannerConfig = {
  maxTimeBetweenChars: 50, // 50ms entre caracteres
  minLength: 8,
  maxLength: 20,
  suffix: 'Enter',
};

class BarcodeScannerServiceImpl {
  private config: BarcodeScannerConfig = DEFAULT_CONFIG;
  private handlers: Set<BarcodeHandler> = new Set();
  private buffer: string = '';
  private lastKeyTime: number = 0;
  private isListening = false;

  /**
   * Configura el servicio
   */
  configure(config: Partial<BarcodeScannerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Inicia la escucha de scanner
   */
  startListening(): void {
    if (this.isListening) return;
    
    if (typeof window !== 'undefined') {
      window.addEventListener('keypress', this.handleKeyPress);
      this.isListening = true;
    }
  }

  /**
   * Detiene la escucha de scanner
   */
  stopListening(): void {
    if (!this.isListening) return;
    
    if (typeof window !== 'undefined') {
      window.removeEventListener('keypress', this.handleKeyPress);
      this.isListening = false;
    }
    
    this.buffer = '';
  }

  /**
   * Registra un handler para códigos de barras
   */
  register(handler: BarcodeHandler): () => void {
    this.handlers.add(handler);

    // Retorna función de cleanup
    return () => {
      this.handlers.delete(handler);
    };
  }

  /**
   * Maneja el evento keypress
   */
  private handleKeyPress = (event: KeyboardEvent): void => {
    const now = Date.now();
    const timeSinceLastKey = now - this.lastKeyTime;

    // Si pasó mucho tiempo, reiniciar buffer
    if (timeSinceLastKey > this.config.maxTimeBetweenChars) {
      this.buffer = '';
    }

    this.lastKeyTime = now;

    // Agregar carácter al buffer
    if (event.key === 'Enter') {
      // Enter detectado, procesar buffer
      this.processBuffer();
    } else if (event.key.length === 1) {
      // Solo caracteres imprimibles
      this.buffer += event.key;
    }
  };

  /**
   * Procesa el buffer acumulado
   */
  private processBuffer(): void {
    const barcode = this.buffer.trim();

    // Validar longitud
    if (
      barcode.length >= this.config.minLength &&
      barcode.length <= this.config.maxLength
    ) {
      // Validar prefijo si está configurado
      if (this.config.prefix && !barcode.startsWith(this.config.prefix)) {
        this.buffer = '';
        return;
      }

      // Notificar a todos los handlers
      this.handlers.forEach(handler => {
        try {
          handler(barcode);
        } catch (error) {
          console.error('Error in barcode handler:', error);
        }
      });
    }

    // Limpiar buffer
    this.buffer = '';
  }

  /**
   * Simula la lectura de un código de barras (para testing)
   */
  simulateScan(barcode: string): void {
    this.handlers.forEach(handler => {
      try {
        handler(barcode);
      } catch (error) {
        console.error('Error in barcode handler:', error);
      }
    });
  }

  /**
   * Limpia todos los handlers
   */
  clear(): void {
    this.handlers.clear();
    this.buffer = '';
  }
}

// Singleton instance
export const BarcodeScannerService = new BarcodeScannerServiceImpl();
