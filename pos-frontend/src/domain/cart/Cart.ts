import { CartItem } from './CartItem';

/**
 * Estructura principal del carrito de venta
 */
export interface Cart {

  /** Ítems de la venta actual */
  items: CartItem[];

  /** Total calculado */
  total: number;

  /** UUID usado para idempotencia */
  clientTransactionId?: string;

}