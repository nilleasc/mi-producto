/**
 * Eventos de dominio del Terminal de Venta
 * 
 * Define todos los eventos que pueden ocurrir en el sistema POS.
 * Estos eventos son inmutables y representan hechos que ya ocurrieron.
 */

export enum DomainEventType {
  // Eventos de producto
  PRODUCT_SEARCH_STARTED = 'PRODUCT_SEARCH_STARTED',
  PRODUCT_FOUND = 'PRODUCT_FOUND',
  PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND',
  PRODUCT_ADDED_TO_CART = 'PRODUCT_ADDED_TO_CART',
  
  // Eventos de carrito
  CART_ITEM_QUANTITY_UPDATED = 'CART_ITEM_QUANTITY_UPDATED',
  CART_ITEM_REMOVED = 'CART_ITEM_REMOVED',
  CART_PRICE_OVERRIDDEN = 'CART_PRICE_OVERRIDDEN',
  CART_CLEARED = 'CART_CLEARED',
  
  // Eventos de checkout
  CHECKOUT_INITIATED = 'CHECKOUT_INITIATED',
  DISCOUNT_CONFIRMATION_REQUIRED = 'DISCOUNT_CONFIRMATION_REQUIRED',
  DISCOUNT_CONFIRMED = 'DISCOUNT_CONFIRMED',
  DISCOUNT_CANCELLED = 'DISCOUNT_CANCELLED',
  PAYMENT_PROCESSING = 'PAYMENT_PROCESSING',
  PAYMENT_SUCCEEDED = 'PAYMENT_SUCCEEDED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  
  // Eventos de venta
  SALE_COMPLETED = 'SALE_COMPLETED',
  SALE_RECEIPT_VIEWED = 'SALE_RECEIPT_VIEWED',
  NEW_SALE_STARTED = 'NEW_SALE_STARTED',
  
  // Eventos de error
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  
  // Eventos de sistema
  OFFLINE_DETECTED = 'OFFLINE_DETECTED',
  ONLINE_RESTORED = 'ONLINE_RESTORED',
  SERVICE_DEGRADED = 'SERVICE_DEGRADED',
  SESSION_STARTED = 'SESSION_STARTED',
  SESSION_RECOVERED = 'SESSION_RECOVERED',
}

/**
 * Evento base de dominio
 */
export interface DomainEvent<T = unknown> {
  type: DomainEventType;
  payload: T;
  timestamp: number;
  sessionId?: string;
}

/**
 * Payloads específicos por tipo de evento
 */

export interface ProductFoundPayload {
  productoId: string;
  nombreProducto: string;
  precioOficial: number;
}

export interface ProductNotFoundPayload {
  productoId: string;
  errorMessage: string;
}

export interface ProductAddedToCartPayload {
  productoId: string;
  nombreProducto: string;
  cantidad: number;
  precioOficial: number;
}

export interface CartItemQuantityUpdatedPayload {
  productoId: string;
  oldQuantity: number;
  newQuantity: number;
}

export interface CartItemRemovedPayload {
  productoId: string;
  nombreProducto: string;
}

export interface CartPriceOverriddenPayload {
  productoId: string;
  precioOficial: number;
  precioOverride: number;
  autorizadoPor: string;
}

export interface DiscountConfirmationRequiredPayload {
  itemsAfectados: string[];
  totalDescuento: number;
}

export interface PaymentFailedPayload {
  errorCode: string;
  errorMessage: string;
  isRetryable: boolean;
}

export interface SaleCompletedPayload {
  ventaId: string;
  totalVenta: number;
  itemsCount: number;
  timestamp: string;
}

export interface NetworkErrorPayload {
  operation: string;
  errorMessage: string;
}

export interface OfflineDetectedPayload {
  lastOnlineTimestamp: number;
}

/**
 * Factory functions para crear eventos
 */
export const createDomainEvent = <T>(
  type: DomainEventType,
  payload: T,
  sessionId?: string
): DomainEvent<T> => ({
  type,
  payload,
  timestamp: Date.now(),
  sessionId,
});
