import { Cart } from '../cart/Cart';
import { CartItem } from '../cart/CartItem';
import { calcularTotal } from './cartCalculations';

/**
 * Deduplica ítems del carrito consolidando productos con el mismo productoId
 * 
 * Si hay múltiples ítems con el mismo productoId, los consolida en uno solo
 * sumando las cantidades y recalculando el subtotal.
 * 
 * @param items - Arreglo de ítems del carrito
 * @returns Nuevo arreglo sin duplicados
 */
export function deduplicar(items: CartItem[]): CartItem[] {
  const mapa = new Map<string, CartItem>();
  
  for (const item of items) {
    const existente = mapa.get(item.productoId);
    
    if (existente) {
      // Consolidar: sumar cantidades y recalcular subtotal
      const nuevaCantidad = existente.cantidad + item.cantidad;
      const nuevoSubtotal = existente.precioAplicado * nuevaCantidad;
      
      mapa.set(item.productoId, {
        ...existente,
        cantidad: nuevaCantidad,
        subtotal: nuevoSubtotal,
      });
    } else {
      mapa.set(item.productoId, item);
    }
  }
  
  return Array.from(mapa.values());
}

/**
 * Agrega un ítem al carrito
 * 
 * Si el producto ya existe, incrementa la cantidad del ítem existente.
 * Si no existe, agrega el nuevo ítem.
 * Retorna un nuevo carrito (inmutable).
 * 
 * @param carrito - Carrito actual
 * @param item - Ítem a agregar
 * @returns Nuevo carrito con el ítem agregado
 */
export function agregarItem(carrito: Cart, item: CartItem): Cart {
  const itemsActualizados = [...carrito.items, item];
  const itemsDeduplicados = deduplicar(itemsActualizados);
  const nuevoTotal = calcularTotal(itemsDeduplicados);
  
  return {
    ...carrito,
    items: itemsDeduplicados,
    total: nuevoTotal,
  };
}

/**
 * Quita un ítem del carrito por su productoId
 * 
 * Filtra el ítem con el productoId especificado y recalcula el total.
 * Retorna un nuevo carrito (inmutable).
 * 
 * @param carrito - Carrito actual
 * @param productoId - ID del producto a eliminar
 * @returns Nuevo carrito sin el ítem
 */
export function quitarItem(carrito: Cart, productoId: string): Cart {
  const itemsFiltrados = carrito.items.filter(item => item.productoId !== productoId);
  const nuevoTotal = calcularTotal(itemsFiltrados);
  
  return {
    ...carrito,
    items: itemsFiltrados,
    total: nuevoTotal,
  };
}

/**
 * Actualiza la cantidad de un ítem en el carrito
 * 
 * Si la nueva cantidad es 0, elimina el ítem.
 * Si la nueva cantidad es > 0, actualiza la cantidad y recalcula el subtotal.
 * Retorna un nuevo carrito (inmutable).
 * 
 * @param carrito - Carrito actual
 * @param productoId - ID del producto a actualizar
 * @param cantidad - Nueva cantidad
 * @returns Nuevo carrito con la cantidad actualizada
 */
export function actualizarCantidad(carrito: Cart, productoId: string, cantidad: number): Cart {
  // Si cantidad es 0, eliminar el ítem
  if (cantidad === 0) {
    return quitarItem(carrito, productoId);
  }
  
  // Actualizar cantidad y recalcular subtotal
  const itemsActualizados = carrito.items.map(item => {
    if (item.productoId === productoId) {
      const nuevoSubtotal = item.precioAplicado * cantidad;
      return {
        ...item,
        cantidad,
        subtotal: nuevoSubtotal,
      };
    }
    return item;
  });
  
  const nuevoTotal = calcularTotal(itemsActualizados);
  
  return {
    ...carrito,
    items: itemsActualizados,
    total: nuevoTotal,
  };
}
