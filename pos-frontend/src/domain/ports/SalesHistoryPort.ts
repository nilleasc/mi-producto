/**
 * Puerto para historial de ventas
 * 
 * Abstrae el acceso al historial de ventas sin referencia
 * a implementaciones concretas de almacenamiento.
 */

import { SaleResponse } from '../sale/Sale';

export interface SaleSearchCriteria {
  /** Buscar por ID de venta */
  ventaId?: string;
  
  /** Buscar por rango de fechas (desde) */
  fechaDesde?: string;
  
  /** Buscar por rango de fechas (hasta) */
  fechaHasta?: string;
  
  /** Buscar por monto mínimo */
  montoMinimo?: number;
  
  /** Buscar por monto máximo */
  montoMaximo?: number;
  
  /** Límite de resultados */
  limit?: number;
  
  /** Offset para paginación */
  offset?: number;
}

export interface SalesHistoryResult {
  /** Ventas encontradas */
  ventas: SaleResponse[];
  
  /** Total de resultados */
  total: number;
  
  /** Indica si hay más resultados */
  hasMore: boolean;
}

export interface SalesHistoryPort {
  /**
   * Lista las ventas según criterios
   */
  listarVentas(criteria: SaleSearchCriteria): Promise<SalesHistoryResult>;
  
  /**
   * Obtiene el detalle de una venta
   */
  obtenerVenta(ventaId: string): Promise<SaleResponse>;
  
  /**
   * Obtiene las últimas N ventas
   */
  obtenerUltimasVentas(limit: number): Promise<SaleResponse[]>;
}
