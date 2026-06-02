/**
 * Hook para gestión de ventas congeladas
 * 
 * Permite congelar, recuperar y listar ventas pausadas.
 */

import { useState, useCallback } from 'react';
import { useDependencies } from '../infrastructure/di/DependencyProvider';
import { Cart } from '../domain/cart/Cart';
import { FrozenSale } from '../domain/ports/FrozenSalesPort';

interface UseFrozenSalesResult {
  /** Ventas congeladas disponibles */
  ventasCongeladas: FrozenSale[];
  
  /** Indica si está cargando */
  cargando: boolean;
  
  /** Error si ocurrió */
  error: string | null;
  
  /** Congela la venta actual */
  congelarVenta: (cart: Cart, nota?: string) => Promise<FrozenSale | null>;
  
  /** Recupera una venta congelada */
  recuperarVenta: (frozenId: string) => Promise<Cart | null>;
  
  /** Elimina una venta congelada */
  eliminarVenta: (frozenId: string) => Promise<void>;
  
  /** Recarga la lista de ventas congeladas */
  recargar: () => Promise<void>;
  
  /** Limpia ventas antiguas */
  limpiarVentasAntiguas: (maxAgeMs: number) => Promise<number>;
}

export function useFrozenSales(): UseFrozenSalesResult {
  const { frozenSalesPort } = useDependencies();
  const [ventasCongeladas, setVentasCongeladas] = useState<FrozenSale[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    setCargando(true);
    setError(null);

    try {
      const ventas = await frozenSalesPort.listarVentasCongeladas();
      setVentasCongeladas(ventas);
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al cargar ventas congeladas';
      setError(mensaje);
      console.error('Error recargando ventas congeladas:', err);
    } finally {
      setCargando(false);
    }
  }, [frozenSalesPort]);

  const congelarVenta = useCallback(async (cart: Cart, nota?: string): Promise<FrozenSale | null> => {
    setCargando(true);
    setError(null);

    try {
      const frozenSale = await frozenSalesPort.congelarVenta(cart, nota);
      await recargar();
      return frozenSale;
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al congelar venta';
      setError(mensaje);
      console.error('Error congelando venta:', err);
      return null;
    } finally {
      setCargando(false);
    }
  }, [frozenSalesPort, recargar]);

  const recuperarVenta = useCallback(async (frozenId: string): Promise<Cart | null> => {
    setCargando(true);
    setError(null);

    try {
      const frozenSale = await frozenSalesPort.recuperarVenta(frozenId);
      return frozenSale.cart;
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al recuperar venta';
      setError(mensaje);
      console.error('Error recuperando venta:', err);
      return null;
    } finally {
      setCargando(false);
    }
  }, [frozenSalesPort]);

  const eliminarVenta = useCallback(async (frozenId: string): Promise<void> => {
    setCargando(true);
    setError(null);

    try {
      await frozenSalesPort.eliminarVentaCongelada(frozenId);
      await recargar();
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al eliminar venta';
      setError(mensaje);
      console.error('Error eliminando venta:', err);
    } finally {
      setCargando(false);
    }
  }, [frozenSalesPort, recargar]);

  const limpiarVentasAntiguas = useCallback(async (maxAgeMs: number): Promise<number> => {
    setCargando(true);
    setError(null);

    try {
      const removed = await frozenSalesPort.limpiarVentasAntiguas(maxAgeMs);
      await recargar();
      return removed;
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al limpiar ventas antiguas';
      setError(mensaje);
      console.error('Error limpiando ventas antiguas:', err);
      return 0;
    } finally {
      setCargando(false);
    }
  }, [frozenSalesPort, recargar]);

  return {
    ventasCongeladas,
    cargando,
    error,
    congelarVenta,
    recuperarVenta,
    eliminarVenta,
    recargar,
    limpiarVentasAntiguas,
  };
}
