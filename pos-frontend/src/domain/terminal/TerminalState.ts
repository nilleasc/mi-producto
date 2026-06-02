/**
 * Estados del Terminal de Venta
 * 
 * Define la máquina de estados del terminal POS.
 * Cada estado representa una fase específica del flujo transaccional.
 */

export enum TerminalState {
  /** Estado inicial - Terminal listo para operar */
  IDLE = 'IDLE',
  
  /** Buscando producto en el sistema */
  SEARCHING_PRODUCT = 'SEARCHING_PRODUCT',
  
  /** Producto encontrado, esperando acción del usuario */
  PRODUCT_FOUND = 'PRODUCT_FOUND',
  
  /** Carrito tiene items, usuario puede modificar o proceder */
  CART_ACTIVE = 'CART_ACTIVE',
  
  /** Usuario inició proceso de checkout */
  CHECKOUT_PENDING = 'CHECKOUT_PENDING',
  
  /** Requiere confirmación de descuentos elevados */
  DISCOUNT_CONFIRMATION = 'DISCOUNT_CONFIRMATION',
  
  /** Procesando pago en el backend */
  PROCESSING_PAYMENT = 'PROCESSING_PAYMENT',
  
  /** Venta completada exitosamente */
  SALE_COMPLETED = 'SALE_COMPLETED',
  
  /** Error recuperable, usuario puede reintentar */
  ERROR = 'ERROR',
  
  /** Sin conexión, funcionalidad limitada */
  OFFLINE_MODE = 'OFFLINE_MODE',
}

/**
 * Transiciones válidas entre estados
 */
export const VALID_TRANSITIONS: Record<TerminalState, TerminalState[]> = {
  [TerminalState.IDLE]: [
    TerminalState.SEARCHING_PRODUCT,
    TerminalState.CART_ACTIVE,
    TerminalState.OFFLINE_MODE,
  ],
  
  [TerminalState.SEARCHING_PRODUCT]: [
    TerminalState.PRODUCT_FOUND,
    TerminalState.IDLE,
    TerminalState.ERROR,
    TerminalState.OFFLINE_MODE,
  ],
  
  [TerminalState.PRODUCT_FOUND]: [
    TerminalState.CART_ACTIVE,
    TerminalState.IDLE,
  ],
  
  [TerminalState.CART_ACTIVE]: [
    TerminalState.IDLE,
    TerminalState.SEARCHING_PRODUCT,
    TerminalState.CHECKOUT_PENDING,
  ],
  
  [TerminalState.CHECKOUT_PENDING]: [
    TerminalState.DISCOUNT_CONFIRMATION,
    TerminalState.PROCESSING_PAYMENT,
    TerminalState.CART_ACTIVE,
  ],
  
  [TerminalState.DISCOUNT_CONFIRMATION]: [
    TerminalState.PROCESSING_PAYMENT,
    TerminalState.CART_ACTIVE,
  ],
  
  [TerminalState.PROCESSING_PAYMENT]: [
    TerminalState.SALE_COMPLETED,
    TerminalState.ERROR,
    TerminalState.OFFLINE_MODE,
  ],
  
  [TerminalState.SALE_COMPLETED]: [
    TerminalState.IDLE,
  ],
  
  [TerminalState.ERROR]: [
    TerminalState.IDLE,
    TerminalState.CART_ACTIVE,
    TerminalState.PROCESSING_PAYMENT, // Retry
  ],
  
  [TerminalState.OFFLINE_MODE]: [
    TerminalState.IDLE,
    TerminalState.CART_ACTIVE,
  ],
};

/**
 * Valida si una transición de estado es válida
 */
export const isValidTransition = (
  from: TerminalState,
  to: TerminalState
): boolean => {
  return VALID_TRANSITIONS[from]?.includes(to) || false;
};

/**
 * Contexto del estado del terminal
 */
export interface TerminalStateContext {
  currentState: TerminalState;
  previousState: TerminalState | null;
  errorMessage: string | null;
  isOffline: boolean;
  isDegraded: boolean;
}
