/**
 * Códigos de error del sistema POS
 * 
 * Enumeración de todos los códigos de error posibles que pueden ocurrir
 * en el sistema, tanto del backend como del frontend.
 */
export enum ErrorCode {
  /** El backend no tiene suficiente stock del producto */
  STOCK_INSUFICIENTE = 'STOCK_INSUFICIENTE',
  
  /** El producto no existe en el sistema del backend */
  PRODUCTO_NO_ENCONTRADO = 'PRODUCTO_NO_ENCONTRADO',
  
  /** El precio override está fuera del rango permitido por el backend */
  PRECIO_FUERA_DE_RANGO = 'PRECIO_FUERA_DE_RANGO',
  
  /** El servicio de stock del backend no está disponible (503) */
  SERVICIO_STOCK_NO_DISPONIBLE = 'SERVICIO_STOCK_NO_DISPONIBLE',
  
  /** Error interno del backend al persistir la venta (500) */
  ERROR_PERSISTENCIA = 'ERROR_PERSISTENCIA',
  
  /** La solicitud no pasó la validación del backend (400) */
  VALIDACION_FALLIDA = 'VALIDACION_FALLIDA',
  
  /** Error de conectividad de red entre el frontend y el backend */
  ERROR_RED = 'ERROR_RED',
}

/**
 * Error estructurado devuelto por el backend o generado por el adaptador HTTP
 */
export interface ApiError {
  /** Código de error del enum ErrorCode */
  codigo: ErrorCode;
  
  /** Descripción legible del error para mostrar al operador */
  mensaje: string;
  
  /** Identificador del campo o ítem afectado (ej. productoId del ítem con error) */
  campo?: string;
}

/**
 * Error de validación generado en la capa de dominio antes de llamar al backend
 */
export interface DomainError {
  /** Código de error del enum ErrorCode */
  codigo: ErrorCode;
  
  /** Descripción del error de validación */
  mensaje: string;
}
