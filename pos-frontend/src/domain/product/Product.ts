/**
 * Producto retail completo
 * 
 * Modelo extendido para soportar operaciones retail reales.
 */
export interface Product {
  /** ID único del producto */
  productoId: string;
  
  /** Nombre del producto */
  nombre: string;
  
  /** Precio oficial de venta */
  precioOficial: number;
  
  /** Código de barras (EAN-13, UPC, etc.) */
  codigoBarras?: string;
  
  /** SKU (Stock Keeping Unit) */
  sku?: string;
  
  /** Stock disponible */
  stock?: number;
  
  /** Categoría del producto */
  categoria?: string;
  
  /** Indica si el producto está activo */
  activo: boolean;
  
  /** Descripción extendida (opcional) */
  descripcion?: string;
  
  /** Imagen del producto (URL) */
  imagenUrl?: string;
  
  /** Fecha de creación */
  creadoEn?: string;
  
  /** Fecha de última actualización */
  actualizadoEn?: string;
}

/**
 * Criterios de búsqueda de productos
 */
export interface ProductSearchCriteria {
  /** Búsqueda por código de producto */
  productoId?: string;
  
  /** Búsqueda por nombre (parcial) */
  nombre?: string;
  
  /** Búsqueda por código de barras */
  codigoBarras?: string;
  
  /** Búsqueda por SKU */
  sku?: string;
  
  /** Filtrar por categoría */
  categoria?: string;
  
  /** Filtrar solo activos */
  soloActivos?: boolean;
  
  /** Límite de resultados */
  limit?: number;
}

/**
 * Resultado de búsqueda de productos
 */
export interface ProductSearchResult {
  /** Productos encontrados */
  productos: Product[];
  
  /** Total de resultados (para paginación) */
  total: number;
  
  /** Indica si hay más resultados */
  hasMore: boolean;
}

/**
 * Producto retornado para búsqueda (compatibilidad)
 */
export interface ProductResponse {
  producto: Product;
}