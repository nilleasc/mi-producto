/**
 * Servicio de notificaciones desacoplado
 * 
 * Gestiona el estado global de notificaciones sin acoplar a ninguna
 * librería específica de UI. Sigue el patrón Observer para notificar
 * cambios a los suscriptores.
 */

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number; // ms, undefined = no auto-dismiss
  timestamp: number;
}

type NotificationListener = (notifications: Notification[]) => void;

class NotificationServiceImpl {
  private notifications: Notification[] = [];
  private listeners: Set<NotificationListener> = new Set();
  private idCounter = 0;

  /**
   * Agrega una notificación al sistema
   */
  add(type: NotificationType, message: string, duration: number = 5000): string {
    const id = `notification-${++this.idCounter}-${Date.now()}`;
    const notification: Notification = {
      id,
      type,
      message,
      duration,
      timestamp: Date.now(),
    };

    this.notifications = [...this.notifications, notification];
    this.notifyListeners();

    // Auto-dismiss si tiene duración
    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }

    return id;
  }

  /**
   * Elimina una notificación por ID
   */
  remove(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
  }

  /**
   * Limpia todas las notificaciones
   */
  clear(): void {
    this.notifications = [];
    this.notifyListeners();
  }

  /**
   * Obtiene todas las notificaciones actuales
   */
  getAll(): Notification[] {
    return [...this.notifications];
  }

  /**
   * Suscribe un listener para recibir actualizaciones
   */
  subscribe(listener: NotificationListener): () => void {
    this.listeners.add(listener);
    // Retorna función de cleanup
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notifica a todos los listeners
   */
  private notifyListeners(): void {
    const notifications = this.getAll();
    this.listeners.forEach(listener => listener(notifications));
  }

  // Métodos de conveniencia
  success(message: string, duration?: number): string {
    return this.add('success', message, duration);
  }

  error(message: string, duration?: number): string {
    return this.add('error', message, duration);
  }

  warning(message: string, duration?: number): string {
    return this.add('warning', message, duration);
  }

  info(message: string, duration?: number): string {
    return this.add('info', message, duration);
  }
}

// Singleton instance
export const NotificationService = new NotificationServiceImpl();
