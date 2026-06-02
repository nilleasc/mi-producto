import { Product, ProductSearchCriteria, ProductSearchResult } from '../product/Product';

/**
 * Puerto para consultar precios de productos
 * 
 * Abstrae la consulta del precio oficial de un producto sin ninguna
 * referencia a implementaciones de red.
 * 
 * Esta interfaz define el contrato que debe cumplir cualquier adaptador
 * que implemente la comunicación con el backend de productos.
 */
export interface ProductoApiPort {
  /**
   * Consulta el precio oficial de un producto por ID
   * 
   * @param productoId - Identificador único del producto
   * @returns Promise que resuelve con Product (productoId + precioUnitario)
   * @throws ApiError con código PRODUCTO_NO_ENCONTRADO (404), VALIDACION_FALLIDA (400) o ERROR_RED
   */
  consultarPrecio(productoId: string): Promise<Product>;
  
  /**
   * Busca productos según criterios
   * 
   * @param criteria - Criterios de búsqueda
   * @returns Promise que resuelve con ProductSearchResult
   * @throws ApiError en caso de error
   */
  buscarProductos(criteria: ProductSearchCriteria): Promise<ProductSearchResult>;
  
  /**
   * Obtiene un producto por código de barras
   * 
   * @param codigoBarras - Código de barras del producto
   * @returns Promise que resuelve con Product
   * @throws ApiError si no se encuentra
   */
  buscarPorCodigoBarras(codigoBarras: string): Promise<Product>;
}
