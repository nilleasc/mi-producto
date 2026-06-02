/**
 * Ítem dentro de una solicitud de venta al backend
 * 
 * Representa un producto con su cantidad y opcionalmente un precio override autorizado.
 */
export interface SaleRequestItem {
  /** Identificador del producto */
  productoId: string;
  
  /** Número de unidades */
  cantidad: number;
  
  /** Precio alternativo autorizado (opcional) */
  precioOverride?: number;
  
  /** Identificador del autorizador del precio override (opcional) */
  autorizadoPor?: string;
}

/**
 * Cuerpo de la solicitud POST /api/v1/ventas
 * 
 * Contiene los ítems de la venta y opcionalmente un UUID para idempotencia.
 */
export interface SaleRequest {
  /** UUID v4 para idempotencia (opcional) */
  clientTransactionId?: string;
  
  /** Arreglo de SaleRequestItem */
  items: SaleRequestItem[];
}

/**
 * Ítem dentro de la respuesta de venta del backend
 * 
 * Representa un producto vendido con los precios aplicados y el subtotal.
 */
export interface SaleItem {
  /** Identificador del producto */
  productoId: string;
  
  /** Unidades vendidas */
  cantidad: number;
  
  /** Precio oficial del producto */
  precioUnitario: number;
  
  /** Precio efectivamente cobrado */
  precioAplicado: number;
  
  /** Monto del ítem en la venta */
  subtotal: number;
}

/**
 * Respuesta del backend tras una venta exitosa
 * 
 * Contiene el identificador de la venta, los ítems vendidos, el total
 * y el timestamp de la transacción.
 */
export interface SaleResponse {
  /** Identificador único de la venta generado por el backend */
  ventaId: string;
  
  /** UUID v4 devuelto por el backend para confirmación de idempotencia (opcional) */
  clientTransactionId?: string;
  
  /** Estado de la venta (ej. COMPLETADA) */
  estado: string;
  
  /** Arreglo de SaleItem con los detalles de cada producto vendido */
  items: SaleItem[];
  
  /** Monto total de la venta */
  totalVenta: number;
  
  /** Fecha y hora de la venta en formato ISO 8601 */
  timestamp: string;
}
