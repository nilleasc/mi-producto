/**
 * Servicio de gestión de sesiones del terminal
 * 
 * Maneja la persistencia y recuperación de sesiones del terminal.
 * Permite continuidad tras recargas o errores.
 */

import {
  TerminalSession,
  createTerminalSession,
  isSessionExpired,
} from '../../domain/terminal/TerminalSession';

const SESSION_STORAGE_KEY = 'pos-terminal-session';

class SessionServiceImpl {
  private currentSession: TerminalSession | null = null;

  /**
   * Inicia una nueva sesión
   */
  startSession(): TerminalSession {
    this.currentSession = createTerminalSession();
    this.persistSession(this.currentSession);
    return this.currentSession;
  }

  /**
   * Obtiene la sesión actual
   */
  getCurrentSession(): TerminalSession | null {
    if (!this.currentSession) {
      this.currentSession = this.loadSession();
    }
    return this.currentSession;
  }

  /**
   * Actualiza la sesión actual
   */
  updateSession(updates: Partial<TerminalSession>): void {
    if (!this.currentSession) {
      this.currentSession = this.startSession();
    }

    this.currentSession = {
      ...this.currentSession,
      ...updates,
      lastActivityAt: Date.now(),
    };

    this.persistSession(this.currentSession);
  }

  /**
   * Recupera una sesión existente o crea una nueva
   */
  recoverOrCreateSession(): TerminalSession {
    const existingSession = this.loadSession();

    if (existingSession && !isSessionExpired(existingSession)) {
      this.currentSession = {
        ...existingSession,
        isRecovering: true,
      };
      return this.currentSession;
    }

    return this.startSession();
  }

  /**
   * Limpia la sesión actual
   */
  clearSession(): void {
    this.currentSession = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }

  /**
   * Persiste la sesión en localStorage
   */
  private persistSession(session: TerminalSession): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Error persisting session:', error);
    }
  }

  /**
   * Carga la sesión desde localStorage
   */
  private loadSession(): TerminalSession | null {
    if (typeof window === 'undefined') return null;

    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!stored) return null;

      const session = JSON.parse(stored) as TerminalSession;
      return session;
    } catch (error) {
      console.error('Error loading session:', error);
      return null;
    }
  }
}

// Singleton instance
export const SessionService = new SessionServiceImpl();
