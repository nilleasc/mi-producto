import { Cart } from '../cart/Cart';

/**
 * Puerto para persistir y recuperar el carrito
 * 
 * Abstrae la persistencia local del carrito entre sesiones y recargas de página
 * sin ninguna referencia a localStorage ni APIs del navegador.
 * 
 * Esta interfaz define el contrato que debe cumplir cualquier adaptador
 * que implemente el almacenamiento del carrito.
 */
export interface CartStoragePort {
  /**
   * Guarda el carrito en el almacenamiento local
   * 
   * @param cart - Carrito completo con items y total
   * @effect Persiste el carrito en el almacenamiento local
   * @note En entorno SSR: no-op (no lanza error)
   */
  guardar(cart: Cart): void;
  
  /**
   * Recupera el carrito desde el almacenamiento local
   * 
   * @returns Cart previamente guardado, o null si no existe o el formato es inválido
   * @note En entorno SSR: devuelve null
   */
  recuperar(): Cart | null;
  
  /**
   * Elimina el carrito del almacenamiento local
   * 
   * @effect Elimina el carrito del almacenamiento local
   * @note En entorno SSR: no-op
   */
  limpiar(): void;
}
