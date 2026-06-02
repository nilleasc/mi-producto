import { ProductoApiPort } from '../../domain/ports/ProductoApiPort';
import { Product, ProductSearchCriteria, ProductSearchResult } from '../../domain/product/Product';
import { ApiError, ErrorCode } from '../../domain/errors/Errors';

/**
 * Adaptador HTTP para consultar productos
 * 
 * Implementa ProductoApiPort usando fetch para comunicarse con el backend.
 * Soporta búsqueda por ID, nombre, código de barras y criterios avanzados.
 */
export class ProductoHttpAdapter implements ProductoApiPort {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async consultarPrecio(productoId: string): Promise<Product> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v1/productos/${encodeURIComponent(productoId)}/precio`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // 200 OK - Producto encontrado
      if (response.status === 200) {
        const data = await response.json();
        return data as Product;
      }

      // 404 Not Found - Producto no encontrado
      if (response.status === 404) {
        throw {
          codigo: ErrorCode.PRODUCTO_NO_ENCONTRADO,
          mensaje: 'Producto no encontrado',
        } as ApiError;
      }

      // 400 Bad Request - Formato de ID inválido
      if (response.status === 400) {
        throw {
          codigo: ErrorCode.VALIDACION_FALLIDA,
          mensaje: 'Formato de ID inválido',
        } as ApiError;
      }

      // 500 Internal Server Error
      if (response.status === 500) {
        throw {
          codigo: ErrorCode.ERROR_RED,
          mensaje: 'Error al consultar precio. Intente nuevamente.',
        } as ApiError;
      }

      // Otros códigos de error
      throw {
        codigo: ErrorCode.ERROR_RED,
        mensaje: `Error HTTP ${response.status}: ${response.statusText}`,
      } as ApiError;

    } catch (error) {
      // Si ya es un ApiError, re-lanzarlo
      if (error && typeof error === 'object' && 'codigo' in error) {
        throw error;
      }

      // Error de red (fetch falló)
      throw {
        codigo: ErrorCode.ERROR_RED,
        mensaje: 'Error al consultar precio. Intente nuevamente.',
      } as ApiError;
    }
  }

  async buscarProductos(criteria: ProductSearchCriteria): Promise<ProductSearchResult> {
    try {
      // Construir query params
      const params = new URLSearchParams();
      
      if (criteria.productoId) params.append('productoId', criteria.productoId);
      if (criteria.nombre) params.append('nombre', criteria.nombre);
      if (criteria.codigoBarras) params.append('codigoBarras', criteria.codigoBarras);
      if (criteria.sku) params.append('sku', criteria.sku);
      if (criteria.categoria) params.append('categoria', criteria.categoria);
      if (criteria.soloActivos !== undefined) params.append('soloActivos', String(criteria.soloActivos));
      if (criteria.limit) params.append('limit', String(criteria.limit));

      const response = await fetch(
        `${this.baseUrl}/api/v1/productos/search?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        const data = await response.json();
        return data as ProductSearchResult;
      }

      if (response.status === 400) {
        throw {
          codigo: ErrorCode.VALIDACION_FALLIDA,
          mensaje: 'Criterios de búsqueda inválidos',
        } as ApiError;
      }

      throw {
        codigo: ErrorCode.ERROR_RED,
        mensaje: `Error HTTP ${response.status}: ${response.statusText}`,
      } as ApiError;

    } catch (error) {
      if (error && typeof error === 'object' && 'codigo' in error) {
        throw error;
      }

      throw {
        codigo: ErrorCode.ERROR_RED,
        mensaje: 'Error al buscar productos. Intente nuevamente.',
      } as ApiError;
    }
  }

  async buscarPorCodigoBarras(codigoBarras: string): Promise<Product> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v1/productos/barcode/${encodeURIComponent(codigoBarras)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        const data = await response.json();
        return data as Product;
      }

      if (response.status === 404) {
        throw {
          codigo: ErrorCode.PRODUCTO_NO_ENCONTRADO,
          mensaje: 'Producto no encontrado con ese código de barras',
        } as ApiError;
      }

      if (response.status === 400) {
        throw {
          codigo: ErrorCode.VALIDACION_FALLIDA,
          mensaje: 'Código de barras inválido',
        } as ApiError;
      }

      throw {
        codigo: ErrorCode.ERROR_RED,
        mensaje: `Error HTTP ${response.status}: ${response.statusText}`,
      } as ApiError;

    } catch (error) {
      if (error && typeof error === 'object' && 'codigo' in error) {
        throw error;
      }

      throw {
        codigo: ErrorCode.ERROR_RED,
        mensaje: 'Error al buscar por código de barras. Intente nuevamente.',
      } as ApiError;
    }
  }
}
