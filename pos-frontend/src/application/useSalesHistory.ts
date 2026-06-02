/**
 * Hook para historial de ventas
 * 
 * Permite consultar y buscar en el historial de ventas completadas.
 */

import { useState, useCallback } from 'react';
import { useDependencies } from '../infrastructure/di/DependencyProvider';
import { SaleResponse } from '../domain/sale/Sale';
import { SaleSearchCriteria, SalesHistoryResult } from '../domain/ports/SalesHistoryPort';

interface UseSalesHistoryResult {
  /** Resultado de búsqueda actual */
  resultado: SalesHistoryResult | null;
  
  /** Detalle de venta individual */
  ventaDetalle: SaleResponse | null;
  
  /** Indica si está cargando */
  cargando: boolean;
  
  /** Error si ocurrió */
  error: string | null;
  
  /** Busca ventas según criterios */
  buscarVentas: (criteria: SaleSearchCriteria) => Promise<void>;
  
  /** Obtiene el detalle de una venta */
  obtenerDetalle: (ventaId: string) => Promise<void>;
  
  /** Obtiene las últimas N ventas */
  obtenerUltimas: (limit: number) => Promise<SaleResponse[]>;
  
  /** Limpia el resultado actual */
  limpiar: () => void;
}

export function useSalesHistory(): UseSalesHistoryResult {
  const { salesHistoryPort } = useDependencies();
  const [resultado, setResultado] = useState<SalesHistoryResult | null>(null);
  const [ventaDetalle, setVentaDetalle] = useState<SaleResponse | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buscarVentas = useCallback(async (criteria: SaleSearchCriteria): Promise<void> => {
    setCargando(true);
    setError(null);
    setResultado(null);

    try {
      const result = await salesHistoryPort.listarVentas(criteria);
      setResultado(result);
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al buscar ventas';
      setError(mensaje);
      console.error('Error buscando ventas:', err);
    } finally {
      setCargando(false);
    }
  }, [salesHistoryPort]);

  const obtenerDetalle = useCallback(async (ventaId: string): Promise<void> => {
    setCargando(true);
    setError(null);
    setVentaDetalle(null);

    try {
      const venta = await salesHistoryPort.obtenerVenta(ventaId);
      setVentaDetalle(venta);
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al obtener detalle de venta';
      setError(mensaje);
      console.error('Error obteniendo detalle:', err);
    } finally {
      setCargando(false);
    }
  }, [salesHistoryPort]);

  const obtenerUltimas = useCallback(async (limit: number): Promise<SaleResponse[]> => {
    setCargando(true);
    setError(null);

    try {
      const ventas = await salesHistoryPort.obtenerUltimasVentas(limit);
      return ventas;
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al obtener últimas ventas';
      setError(mensaje);
      console.error('Error obteniendo últimas ventas:', err);
      return [];
    } finally {
      setCargando(false);
    }
  }, [salesHistoryPort]);

  const limpiar = useCallback(() => {
    setResultado(null);
    setVentaDetalle(null);
    setError(null);
  }, []);

  return {
    resultado,
    ventaDetalle,
    cargando,
    error,
    buscarVentas,
    obtenerDetalle,
    obtenerUltimas,
    limpiar,
  };
}
