'use client';

import { useState } from 'react';
import { useDependencies } from '../infrastructure/di/DependencyProvider';
import { Cart } from '../domain/cart/Cart';
import { CartState } from '../domain/cart/CartState';
import { SaleRequest, SaleResponse } from '../domain/sale/Sale';
import { ApiError, ErrorCode } from '../domain/errors/Errors';
import { generarClientTransactionId } from '../domain/logic/transactionId';
import { calcularUmbralDescuento } from '../domain/logic/priceValidation';

export function useCheckout() {
  const { ventaApi } = useDependencies();
  const [estado, setEstado] = useState<CartState>(CartState.IDLE);
  const [error, setError] = useState<ApiError | null>(null);
  const [ventaResponse, setVentaResponse] = useState<SaleResponse | null>(null);
  const [clientTransactionId, setClientTransactionId] = useState<string | null>(null);
  const [bannerServicioDegradado, setBannerServicioDegradado] = useState(false);

  const iniciarCobro = (cart: Cart): { requiereConfirmacion: boolean; itemsAfectados: string[] } => {
    // Verificar carrito vacío
    if (cart.items.length === 0) {
      return { requiereConfirmacion: false, itemsAfectados: [] };
    }

    // Verificar autorizaciones
    for (const item of cart.items) {
      if (item.precioOverride && (!item.autorizadoPor || item.autorizadoPor.trim() === '')) {
        setError({
          codigo: ErrorCode.VALIDACION_FALLIDA,
          mensaje: 'Se requiere autorización para el precio modificado',
          campo: item.productoId,
        });
        return { requiereConfirmacion: false, itemsAfectados: [] };
      }
    }

    // Identificar ítems con override bajo umbral
    const itemsBajoUmbral = cart.items.filter(item => {
      if (!item.precioOverride) return false;
      const umbral = calcularUmbralDescuento(item.precioOficial);
      return item.precioOverride < umbral;
    });

    if (itemsBajoUmbral.length > 0) {
      return {
        requiereConfirmacion: true,
        itemsAfectados: itemsBajoUmbral.map(i => i.productoId),
      };
    }

    return { requiereConfirmacion: false, itemsAfectados: [] };
  };

  const confirmarCobro = async (cart: Cart, onVaciarCarrito: () => void) => {
    // Generar o reutilizar clientTransactionId
    if (!clientTransactionId) {
      setClientTransactionId(generarClientTransactionId());
    }

    setEstado(CartState.PROCESANDO);
    setError(null);
    setBannerServicioDegradado(false);

    const request: SaleRequest = {
      clientTransactionId: clientTransactionId || generarClientTransactionId(),
      items: cart.items.map(item => ({
        productoId: item.productoId,
        cantidad: item.cantidad,
        precioOverride: item.precioOverride,
        autorizadoPor: item.autorizadoPor,
      })),
    };

    try {
      const response = await ventaApi.enviarVenta(request);
      setVentaResponse(response);
      setEstado(CartState.COMPLETADA);
      onVaciarCarrito();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      setEstado(CartState.ERROR);

      if (apiError.codigo === ErrorCode.SERVICIO_STOCK_NO_DISPONIBLE) {
        setBannerServicioDegradado(true);
      }
    }
  };

  const reintentar = async (cart: Cart, onVaciarCarrito: () => void) => {
    await confirmarCobro(cart, onVaciarCarrito);
  };

  const resetear = () => {
    setEstado(CartState.IDLE);
    setError(null);
    setVentaResponse(null);
    setClientTransactionId(null);
    setBannerServicioDegradado(false);
  };

  return {
    estado,
    error,
    ventaResponse,
    bannerServicioDegradado,
    iniciarCobro,
    confirmarCobro,
    reintentar,
    resetear,
  };
}
