/**
 * Puerto para ventas congeladas
 * 
 * Abstrae la gestión de ventas congeladas (pausadas temporalmente)
 * sin referencia a implementaciones de almacenamiento.
 */

import { Cart } from '../cart/Cart';

export interface FrozenSale {
  /** ID único de la venta congelada */
  frozenId: string;
  
  /** Carrito congelado */
  cart: Cart;
  
  /** Timestamp de congelación */
  frozenAt: number;
  
  /** Usuario que congeló (opcional) */
  frozenBy?: string;
  
  /** Nota o razón (opcional) */
  nota?: string;
  
  /** Sesión del terminal */
  sessionId?: string;
}

export interface FrozenSalesPort {
  /**
   * Congela una venta actual
   */
  congelarVenta(cart: Cart, nota?: string): Promise<FrozenSale>;
  
  /**
   * Lista todas las ventas congeladas
   */
  listarVentasCongeladas(): Promise<FrozenSale[]>;
  
  /**
   * Recupera una venta congelada
   */
  recuperarVenta(frozenId: string): Promise<FrozenSale>;
  
  /**
   * Elimina una venta congelada
   */
  eliminarVentaCongelada(frozenId: string): Promise<void>;
  
  /**
   * Limpia ventas congeladas antiguas
   */
  limpiarVentasAntiguas(maxAgeMs: number): Promise<number>;
}
