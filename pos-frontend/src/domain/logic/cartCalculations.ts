import { CartItem } from '../cart/CartItem';

/**
 * Redondea un número usando la estrategia HALF_UP
 * 
 * HALF_UP significa que 0.5 se redondea hacia arriba.
 * Ejemplos: 0.5 → 1, 1.5 → 2, 2.25 → 2.25
 * 
 * @param valor - Número a redondear
 * @param decimales - Número de decimales (por defecto 2)
 * @returns Número redondeado con la precisión especificada
 */
export function redondeoHalfUp(valor: number, decimales: number = 2): number {
  const factor = Math.pow(10, decimales);
  return Math.round(valor * factor) / factor;
}

/**
 * Calcula el subtotal de un ítem del carrito
 * 
 * Multiplica el precio aplicado por la cantidad y redondea con HALF_UP a 2 decimales.
 * 
 * @param precioAplicado - Precio unitario efectivo (puede ser precio oficial o precio override)
 * @param cantidad - Número de unidades
 * @returns Subtotal redondeado a 2 decimales
 */
export function calcularSubtotal(precioAplicado: number, cantidad: number): number {
  return redondeoHalfUp(precioAplicado * cantidad, 2);
}

/**
 * Calcula el total del carrito sumando todos los subtotales
 * 
 * Suma los subtotales de todos los ítems y redondea con HALF_UP a 2 decimales.
 * 
 * @param items - Arreglo de ítems del carrito
 * @returns Total del carrito redondeado a 2 decimales
 */
export function calcularTotal(items: CartItem[]): number {
  const suma = items.reduce((acc, item) => acc + item.subtotal, 0);
  return redondeoHalfUp(suma, 2);
}
