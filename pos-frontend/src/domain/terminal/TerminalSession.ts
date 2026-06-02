/**
 * Sesión del Terminal de Venta
 * 
 * Representa una sesión activa del terminal con su estado
 * y capacidad de recuperación.
 */

import { Cart } from '../cart/Cart';
import { TerminalState } from './TerminalState';

export interface TerminalSession {
  /** ID único de la sesión */
  sessionId: string;
  
  /** Timestamp de inicio de sesión */
  startedAt: number;
  
  /** Timestamp de última actividad */
  lastActivityAt: number;
  
  /** Estado actual del terminal */
  terminalState: TerminalState;
  
  /** Carrito de la sesión */
  cart: Cart;
  
  /** ID de transacción para idempotencia */
  clientTransactionId: string | null;
  
  /** Contador de reintentos */
  retryCount: number;
  
  /** Indica si la sesión está en modo recuperación */
  isRecovering: boolean;
}

/**
 * Crea una nueva sesión de terminal
 */
export const createTerminalSession = (): TerminalSession => ({
  sessionId: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  startedAt: Date.now(),
  lastActivityAt: Date.now(),
  terminalState: TerminalState.IDLE,
  cart: { items: [], total: 0 },
  clientTransactionId: null,
  retryCount: 0,
  isRecovering: false,
});

/**
 * Actualiza el timestamp de última actividad
 */
export const updateSessionActivity = (
  session: TerminalSession
): TerminalSession => ({
  ...session,
  lastActivityAt: Date.now(),
});

/**
 * Verifica si una sesión está expirada
 */
export const isSessionExpired = (
  session: TerminalSession,
  expirationMs: number = 30 * 60 * 1000 // 30 minutos por defecto
): boolean => {
  return Date.now() - session.lastActivityAt > expirationMs;
};
