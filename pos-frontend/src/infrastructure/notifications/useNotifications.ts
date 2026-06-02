'use client';

import { useState, useEffect } from 'react';
import { NotificationService, Notification, NotificationType } from './NotificationService';

/**
 * Hook para consumir el servicio de notificaciones
 * 
 * Proporciona acceso al estado de notificaciones y métodos
 * para agregar/eliminar notificaciones desde componentes React.
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Suscribirse al servicio
    const unsubscribe = NotificationService.subscribe((newNotifications) => {
      setNotifications(newNotifications);
    });

    // Obtener estado inicial
    setNotifications(NotificationService.getAll());

    // Cleanup
    return unsubscribe;
  }, []);

  return {
    notifications,
    add: (type: NotificationType, message: string, duration?: number) =>
      NotificationService.add(type, message, duration),
    remove: (id: string) => NotificationService.remove(id),
    clear: () => NotificationService.clear(),
    success: (message: string, duration?: number) => NotificationService.success(message, duration),
    error: (message: string, duration?: number) => NotificationService.error(message, duration),
    warning: (message: string, duration?: number) => NotificationService.warning(message, duration),
    info: (message: string, duration?: number) => NotificationService.info(message, duration),
  };
}
