/**
 * Orquestador del Terminal de Venta
 * 
 * Coordina el flujo completo del POS centralizando:
 * - Máquina de estados del terminal
 * - Coordinación de hooks existentes
 * - Publicación de eventos de dominio
 * - Gestión de sesiones
 * - Transiciones de estado
 * 
 * Este orquestador NO contiene lógica de negocio, solo coordina.
 */

import { Cart } from '../../domain/cart/Cart';
import { CartItem } from '../../domain/cart/CartItem';
import { Product } from '../../domain/product/Product';
import { SaleResponse } from '../../domain/sale/Sale';
import { ApiError } from '../../domain/errors/Errors';
import { TerminalState, isValidTransition, TerminalStateContext } from '../../domain/terminal/TerminalState';
import { TerminalSession } from '../../domain/terminal/TerminalSession';
import {
  DomainEventType,
  createDomainEvent,
  ProductFoundPayload,
  ProductAddedToCartPayload,
  SaleCompletedPayload,
  PaymentFailedPayload,
} from '../../domain/events/DomainEvents';
import { EventBus } from '../../infrastructure/events/EventBus';
import { SessionService } from '../../infrastructure/session/SessionService';

export interface TerminalActions {
  // Búsqueda de productos
  searchProduct: (productoId: string) => Promise<void>;
  clearSearch: () => void;
  
  // Gestión del carrito
  addProductToCart: (product: Product, cantidad: number) => void;
  updateQuantity: (productoId: string, cantidad: number) => void;
  removeItem: (productoId: string) => void;
  updatePriceOverride: (productoId: string, precioOverride: number, autorizadoPor: string) => void;
  clearCart: () => void;
  
  // Proceso de checkout
  initiateCheckout: () => void;
  confirmDiscount: () => Promise<void>;
  cancelDiscount: () => void;
  retryPayment: () => Promise<void>;
  
  // Nueva venta
  startNewSale: () => void;
  
  // Recuperación
  recoverSession: () => void;
}

export interface TerminalOrchestrator {
  // Estado
  state: TerminalStateContext;
  session: TerminalSession;
  cart: Cart;
  searchResult: Product | null;
  saleResult: SaleResponse | null;
  error: ApiError | null;
  isSearching: boolean;
  isProcessing: boolean;
  requiresDiscountConfirmation: boolean;
  itemsWithDiscount: CartItem[];
  
  // Acciones
  actions: TerminalActions;
  
  // Transiciones de estado
  transitionTo: (newState: TerminalState, errorMessage?: string) => void;
}

/**
 * Crea el contexto inicial del estado del terminal
 */
export const createInitialStateContext = (): TerminalStateContext => ({
  currentState: TerminalState.IDLE,
  previousState: null,
  errorMessage: null,
  isOffline: false,
  isDegraded: false,
});

/**
 * Valida y ejecuta una transición de estado
 */
export const executeStateTransition = (
  context: TerminalStateContext,
  newState: TerminalState,
  errorMessage?: string
): TerminalStateContext => {
  if (!isValidTransition(context.currentState, newState)) {
    console.warn(
      `Invalid state transition: ${context.currentState} -> ${newState}`
    );
    return context;
  }

  return {
    ...context,
    previousState: context.currentState,
    currentState: newState,
    errorMessage: errorMessage || null,
  };
};

/**
 * Publica evento de dominio con sessionId
 */
export const publishDomainEvent = <T>(
  eventType: DomainEventType,
  payload: T,
  sessionId?: string
): void => {
  const event = createDomainEvent(eventType, payload, sessionId);
  EventBus.publish(event);
};

/**
 * Determina si el carrito requiere confirmación de descuentos
 */
export const checkDiscountConfirmation = (cart: Cart): {
  required: boolean;
  items: CartItem[];
} => {
  const itemsWithHighDiscount = cart.items.filter(item => {
    if (!item.precioOverride) return false;
    const umbral = item.precioOficial * 0.7;
    return item.precioOverride < umbral;
  });

  return {
    required: itemsWithHighDiscount.length > 0,
    items: itemsWithHighDiscount,
  };
};

/**
 * Mapea eventos de dominio a transiciones de estado
 */
export const mapEventToStateTransition = (
  eventType: DomainEventType
): TerminalState | null => {
  const mapping: Partial<Record<DomainEventType, TerminalState>> = {
    [DomainEventType.PRODUCT_SEARCH_STARTED]: TerminalState.SEARCHING_PRODUCT,
    [DomainEventType.PRODUCT_FOUND]: TerminalState.PRODUCT_FOUND,
    [DomainEventType.PRODUCT_ADDED_TO_CART]: TerminalState.CART_ACTIVE,
    [DomainEventType.CHECKOUT_INITIATED]: TerminalState.CHECKOUT_PENDING,
    [DomainEventType.DISCOUNT_CONFIRMATION_REQUIRED]: TerminalState.DISCOUNT_CONFIRMATION,
    [DomainEventType.PAYMENT_PROCESSING]: TerminalState.PROCESSING_PAYMENT,
    [DomainEventType.SALE_COMPLETED]: TerminalState.SALE_COMPLETED,
    [DomainEventType.PAYMENT_FAILED]: TerminalState.ERROR,
    [DomainEventType.OFFLINE_DETECTED]: TerminalState.OFFLINE_MODE,
    [DomainEventType.NEW_SALE_STARTED]: TerminalState.IDLE,
  };

  return mapping[eventType] || null;
};
