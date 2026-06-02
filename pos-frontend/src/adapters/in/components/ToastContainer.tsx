'use client';

import { useNotifications } from '../../../infrastructure/notifications/useNotifications';
import { Toast } from './Toast';

/**
 * Contenedor de notificaciones toast
 * 
 * Se posiciona en la esquina superior derecha y muestra
 * todas las notificaciones activas en una cola vertical.
 */
export function ToastContainer() {
  const { notifications, remove } = useNotifications();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col items-end"
      aria-live="polite"
      aria-atomic="false"
    >
      {notifications.map((notification) => (
        <Toast key={notification.id} notification={notification} onDismiss={remove} />
      ))}
    </div>
  );
}
