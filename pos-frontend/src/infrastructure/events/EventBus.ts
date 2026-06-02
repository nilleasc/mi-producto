/**
 * Event Bus para comunicación desacoplada
 * 
 * Implementa el patrón Publish-Subscribe para eventos de dominio.
 * Permite que componentes se comuniquen sin conocerse directamente.
 */

import { DomainEvent, DomainEventType } from '../../domain/events/DomainEvents';

type EventHandler<T = unknown> = (event: DomainEvent<T>) => void;
type EventSubscription = () => void;

class EventBusImpl {
  private handlers: Map<DomainEventType, Set<EventHandler>> = new Map();
  private globalHandlers: Set<EventHandler> = new Set();

  /**
   * Publica un evento a todos los suscriptores
   */
  publish<T>(event: DomainEvent<T>): void {
    // Notificar handlers específicos del tipo de evento
    const typeHandlers = this.handlers.get(event.type);
    if (typeHandlers) {
      typeHandlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error(`Error in event handler for ${event.type}:`, error);
        }
      });
    }

    // Notificar handlers globales
    this.globalHandlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error(`Error in global event handler:`, error);
      }
    });
  }

  /**
   * Suscribe un handler a un tipo específico de evento
   */
  subscribe<T>(
    eventType: DomainEventType,
    handler: EventHandler<T>
  ): EventSubscription {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }

    const handlers = this.handlers.get(eventType)!;
    handlers.add(handler as EventHandler);

    // Retorna función de cleanup
    return () => {
      handlers.delete(handler as EventHandler);
      if (handlers.size === 0) {
        this.handlers.delete(eventType);
      }
    };
  }

  /**
   * Suscribe un handler a todos los eventos
   */
  subscribeAll(handler: EventHandler): EventSubscription {
    this.globalHandlers.add(handler);

    // Retorna función de cleanup
    return () => {
      this.globalHandlers.delete(handler);
    };
  }

  /**
   * Limpia todos los handlers (útil para testing)
   */
  clear(): void {
    this.handlers.clear();
    this.globalHandlers.clear();
  }

  /**
   * Obtiene el número de suscriptores para un tipo de evento
   */
  getSubscriberCount(eventType?: DomainEventType): number {
    if (eventType) {
      return this.handlers.get(eventType)?.size || 0;
    }
    // Retorna total de suscriptores
    let total = this.globalHandlers.size;
    this.handlers.forEach(handlers => {
      total += handlers.size;
    });
    return total;
  }
}

// Singleton instance
export const EventBus = new EventBusImpl();
