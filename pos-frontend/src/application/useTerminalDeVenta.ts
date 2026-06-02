'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCart } from './useCart';
import { useCheckout } from './useCheckout';
import { useProductSearch } from './useProductSearch';
import { useNotifications } from '../infrastructure/notifications/useNotifications';
import { Product } from '../domain/product/Product';
import { CartItem } from '../domain/cart/CartItem';
import { TerminalState } from '../domain/terminal/TerminalState';
import {
  TerminalOrchestrator,
  TerminalActions,
  createInitialStateContext,
  executeStateTransition,
  publishDomainEvent,
  checkDiscountConfirmation,
} from './services/TerminalDeVentaOrchestrator';
import { DomainEventType } from '../domain/events/DomainEvents';
import { SessionService } from '../infrastructure/session/SessionService';
import { CartState } from '../domain/cart/CartState';

/**
 * Hook principal del Terminal de Venta
 * 
 * Centraliza toda la lógica de coordinación del POS.
 * PosPage solo debe consumir este hook.
 */
export function useTerminalDeVenta(): TerminalOrchestrator {
  // Hooks existentes
  const cartHook = useCart();
  const checkoutHook = useCheckout();
  const searchHook = useProductSearch();
  const notifications = useNotifications();

  // Estado del terminal
  const [stateContext, setStateContext] = useState(createInitialStateContext());
  const [session] = useState(() => SessionService.recoverOrCreateSession());
  const [itemsWithDiscount, setItemsWithDiscount] = useState<CartItem[]>([]);

  // Función de transición de estado
  const transitionTo = useCallback((newState: TerminalState, errorMessage?: string) => {
    setStateContext(prev => executeStateTransition(prev, newState, errorMessage));
  }, []);

  // Sincronizar estado del terminal con estado de checkout
  useEffect(() => {
    if (checkoutHook.estado === CartState.PROCESANDO) {
      transitionTo(TerminalState.PROCESSING_PAYMENT);
    } else if (checkoutHook.estado === CartState.COMPLETADA) {
      transitionTo(TerminalState.SALE_COMPLETED);
    } else if (checkoutHook.estado === CartState.ERROR) {
      transitionTo(TerminalState.ERROR, checkoutHook.error?.mensaje);
    }
  }, [checkoutHook.estado, checkoutHook.error, transitionTo]);

  // Sincronizar estado de búsqueda
  useEffect(() => {
    if (searchHook.cargando) {
      transitionTo(TerminalState.SEARCHING_PRODUCT);
    } else if (searchHook.resultado) {
      transitionTo(TerminalState.PRODUCT_FOUND);
    }
  }, [searchHook.cargando, searchHook.resultado, transitionTo]);

  // Sincronizar estado del carrito
  useEffect(() => {
    if (cartHook.cart.items.length > 0 && stateContext.currentState === TerminalState.IDLE) {
      transitionTo(TerminalState.CART_ACTIVE);
    } else if (cartHook.cart.items.length === 0 && stateContext.currentState === TerminalState.CART_ACTIVE) {
      transitionTo(TerminalState.IDLE);
    }
  }, [cartHook.cart.items.length, stateContext.currentState, transitionTo]);

  // Detectar modo offline/degradado
  useEffect(() => {
    if (checkoutHook.bannerServicioDegradado) {
      setStateContext(prev => ({ ...prev, isDegraded: true }));
    }
  }, [checkoutHook.bannerServicioDegradado]);

  // Actualizar sesión con cambios
  useEffect(() => {
    SessionService.updateSession({
      terminalState: stateContext.currentState,
      cart: cartHook.cart,
      lastActivityAt: Date.now(),
    });
  }, [stateContext.currentState, cartHook.cart]);

  // Acciones del terminal
  const actions: TerminalActions = {
    // Búsqueda de productos
    searchProduct: async (productoId: string) => {
      publishDomainEvent(DomainEventType.PRODUCT_SEARCH_STARTED, { productoId }, session.sessionId);
      await searchHook.buscar(productoId);
    },

    clearSearch: () => {
      searchHook.limpiar();
      if (cartHook.cart.items.length > 0) {
        transitionTo(TerminalState.CART_ACTIVE);
      } else {
        transitionTo(TerminalState.IDLE);
      }
    },

    // Gestión del carrito
    addProductToCart: (product: Product, cantidad: number) => {
      cartHook.agregarProducto(product.productoId, product.nombre, product.precioOficial, cantidad);
      
      publishDomainEvent(
        DomainEventType.PRODUCT_ADDED_TO_CART,
        {
          productoId: product.productoId,
          nombreProducto: product.nombre,
          cantidad,
          precioOficial: product.precioOficial,
        },
        session.sessionId
      );

      notifications.success(`${product.nombre} agregado al carrito`);
      searchHook.limpiar();
      transitionTo(TerminalState.CART_ACTIVE);
    },

    updateQuantity: (productoId: string, cantidad: number) => {
      cartHook.modificarCantidad(productoId, cantidad);
      publishDomainEvent(
        DomainEventType.CART_ITEM_QUANTITY_UPDATED,
        { productoId, oldQuantity: 0, newQuantity: cantidad },
        session.sessionId
      );
    },

    removeItem: (productoId: string) => {
      const item = cartHook.cart.items.find(i => i.productoId === productoId);
      cartHook.eliminarItem(productoId);
      
      if (item) {
        publishDomainEvent(
          DomainEventType.CART_ITEM_REMOVED,
          { productoId, nombreProducto: item.nombreProducto },
          session.sessionId
        );
      }
    },

    updatePriceOverride: (productoId: string, precioOverride: number, autorizadoPor: string) => {
      const item = cartHook.cart.items.find(i => i.productoId === productoId);
      if (item) {
        cartHook.actualizarPrecioOverride(productoId, precioOverride, autorizadoPor);
        publishDomainEvent(
          DomainEventType.CART_PRICE_OVERRIDDEN,
          {
            productoId,
            precioOficial: item.precioOficial,
            precioOverride,
            autorizadoPor,
          },
          session.sessionId
        );
      }
    },

    clearCart: () => {
      cartHook.vaciarCarrito();
      publishDomainEvent(DomainEventType.CART_CLEARED, {}, session.sessionId);
      transitionTo(TerminalState.IDLE);
    },

    // Proceso de checkout
    initiateCheckout: () => {
      const { requiereConfirmacion, itemsAfectados } = checkoutHook.iniciarCobro(cartHook.cart);
      
      publishDomainEvent(DomainEventType.CHECKOUT_INITIATED, {}, session.sessionId);

      if (requiereConfirmacion) {
        const items = cartHook.cart.items.filter(item => itemsAfectados.includes(item.productoId));
        setItemsWithDiscount(items);
        transitionTo(TerminalState.DISCOUNT_CONFIRMATION);
        
        publishDomainEvent(
          DomainEventType.DISCOUNT_CONFIRMATION_REQUIRED,
          { itemsAfectados, totalDescuento: 0 },
          session.sessionId
        );
      } else {
        transitionTo(TerminalState.PROCESSING_PAYMENT);
        checkoutHook.confirmarCobro(cartHook.cart, cartHook.vaciarCarrito);
      }
    },

    confirmDiscount: async () => {
      publishDomainEvent(DomainEventType.DISCOUNT_CONFIRMED, {}, session.sessionId);
      transitionTo(TerminalState.PROCESSING_PAYMENT);
      await checkoutHook.confirmarCobro(cartHook.cart, cartHook.vaciarCarrito);
    },

    cancelDiscount: () => {
      publishDomainEvent(DomainEventType.DISCOUNT_CANCELLED, {}, session.sessionId);
      setItemsWithDiscount([]);
      transitionTo(TerminalState.CART_ACTIVE);
    },

    retryPayment: async () => {
      transitionTo(TerminalState.PROCESSING_PAYMENT);
      await checkoutHook.reintentar(cartHook.cart, cartHook.vaciarCarrito);
    },

    // Nueva venta
    startNewSale: () => {
      checkoutHook.resetear();
      cartHook.vaciarCarrito();
      searchHook.limpiar();
      setItemsWithDiscount([]);
      
      publishDomainEvent(DomainEventType.NEW_SALE_STARTED, {}, session.sessionId);
      transitionTo(TerminalState.IDLE);
      
      notifications.info('Nueva venta iniciada');
    },

    // Recuperación
    recoverSession: () => {
      const recoveredSession = SessionService.recoverOrCreateSession();
      if (recoveredSession.isRecovering) {
        notifications.info('Sesión recuperada');
        publishDomainEvent(DomainEventType.SESSION_RECOVERED, {}, recoveredSession.sessionId);
      }
    },
  };

  // Notificaciones automáticas basadas en eventos
  useEffect(() => {
    if (checkoutHook.ventaResponse && stateContext.currentState === TerminalState.SALE_COMPLETED) {
      notifications.success(`Venta completada. ID: ${checkoutHook.ventaResponse.ventaId}`);
      
      publishDomainEvent(
        DomainEventType.SALE_COMPLETED,
        {
          ventaId: checkoutHook.ventaResponse.ventaId,
          totalVenta: checkoutHook.ventaResponse.totalVenta,
          itemsCount: checkoutHook.ventaResponse.items.length,
          timestamp: checkoutHook.ventaResponse.timestamp,
        },
        session.sessionId
      );
    }
  }, [checkoutHook.ventaResponse, stateContext.currentState, notifications, session.sessionId]);

  useEffect(() => {
    if (checkoutHook.error && stateContext.currentState === TerminalState.ERROR) {
      notifications.error(checkoutHook.error.mensaje);
      
      publishDomainEvent(
        DomainEventType.PAYMENT_FAILED,
        {
          errorCode: checkoutHook.error.codigo,
          errorMessage: checkoutHook.error.mensaje,
          isRetryable: checkoutHook.error.codigo === 'ERROR_PERSISTENCIA',
        },
        session.sessionId
      );
    }
  }, [checkoutHook.error, stateContext.currentState, notifications, session.sessionId]);

  return {
    // Estado
    state: stateContext,
    session,
    cart: cartHook.cart,
    searchResult: searchHook.resultado,
    saleResult: checkoutHook.ventaResponse,
    error: checkoutHook.error,
    isSearching: searchHook.cargando,
    isProcessing: checkoutHook.estado === CartState.PROCESANDO,
    requiresDiscountConfirmation: stateContext.currentState === TerminalState.DISCOUNT_CONFIRMATION,
    itemsWithDiscount,
    
    // Acciones
    actions,
    
    // Transición de estado
    transitionTo,
  };
}
