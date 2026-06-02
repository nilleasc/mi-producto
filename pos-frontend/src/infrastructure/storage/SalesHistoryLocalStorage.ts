/**
 * Adaptador de almacenamiento local para historial de ventas
 * 
 * Implementa SalesHistoryPort usando localStorage para persistir
 * el historial de ventas completadas.
 * 
 * NOTA: En producción, esto debería conectarse a DynamoDB o backend real.
 */

import { SalesHistoryPort, SaleSearchCriteria, SalesHistoryResult } from '../../domain/ports/SalesHistoryPort';
import { SaleResponse } from '../../domain/sale/Sale';

const STORAGE_KEY = 'pos-sales-history';
const MAX_HISTORY_SIZE = 1000; // Máximo número de ventas en localStorage

export class SalesHistoryLocalStorage implements SalesHistoryPort {
  
  async listarVentas(criteria: SaleSearchCriteria): Promise<SalesHistoryResult> {
    const allSales = this.getAllSales();
    let filtered = this.filterSales(allSales, criteria);

    // Paginación
    const offset = criteria.offset || 0;
    const limit = criteria.limit || 50;
    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);

    return {
      ventas: paginated,
      total,
      hasMore: offset + limit < total,
    };
  }

  async obtenerVenta(ventaId: string): Promise<SaleResponse> {
    const allSales = this.getAllSales();
    const sale = allSales.find(s => s.ventaId === ventaId);

    if (!sale) {
      throw new Error(`Venta no encontrada: ${ventaId}`);
    }

    return sale;
  }

  async obtenerUltimasVentas(limit: number): Promise<SaleResponse[]> {
    const allSales = this.getAllSales();
    
    // Ordenar por timestamp descendente y tomar los primeros N
    return allSales
      .sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return timeB - timeA;
      })
      .slice(0, limit);
  }

  /**
   * Guarda una nueva venta en el historial
   * (Método de utilidad, no parte del puerto)
   */
  async guardarVenta(sale: SaleResponse): Promise<void> {
    const sales = this.getAllSales();
    
    // Agregar nueva venta
    sales.unshift(sale); // Agregar al inicio
    
    // Limitar tamaño del historial
    if (sales.length > MAX_HISTORY_SIZE) {
      sales.length = MAX_HISTORY_SIZE;
    }
    
    this.saveSales(sales);
  }

  /**
   * Métodos privados de utilidad
   */

  private getAllSales(): SaleResponse[] {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data) as SaleResponse[];
    } catch (error) {
      console.error('Error reading sales history:', error);
      return [];
    }
  }

  private saveSales(sales: SaleResponse[]): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sales));
    } catch (error) {
      console.error('Error saving sales history:', error);
    }
  }

  private filterSales(sales: SaleResponse[], criteria: SaleSearchCriteria): SaleResponse[] {
    let filtered = [...sales];

    // Filtrar por ventaId
    if (criteria.ventaId) {
      filtered = filtered.filter(s => s.ventaId === criteria.ventaId);
    }

    // Filtrar por rango de fechas
    if (criteria.fechaDesde) {
      const desde = new Date(criteria.fechaDesde).getTime();
      filtered = filtered.filter(s => new Date(s.timestamp).getTime() >= desde);
    }

    if (criteria.fechaHasta) {
      const hasta = new Date(criteria.fechaHasta).getTime();
      filtered = filtered.filter(s => new Date(s.timestamp).getTime() <= hasta);
    }

    // Filtrar por monto
    if (criteria.montoMinimo !== undefined) {
      filtered = filtered.filter(s => s.totalVenta >= criteria.montoMinimo!);
    }

    if (criteria.montoMaximo !== undefined) {
      filtered = filtered.filter(s => s.totalVenta <= criteria.montoMaximo!);
    }

    return filtered;
  }

  /**
   * Limpia todo el historial (útil para testing)
   */
  async limpiarHistorial(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  /**
   * Obtiene el tamaño actual del historial
   */
  async obtenerTamanoHistorial(): Promise<number> {
    return this.getAllSales().length;
  }
}
