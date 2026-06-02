import { VentaApiPort } from '../../domain/ports/VentaApiPort';
import { SaleRequest, SaleResponse } from '../../domain/sale/Sale';
import { ApiError, ErrorCode } from '../../domain/errors/Errors';

/**
 * Adaptador HTTP para enviar ventas al backend
 * 
 * Implementa VentaApiPort usando fetch para comunicarse con el endpoint
 * POST /api/v1/ventas del backend.
 */
export class VentaHttpAdapter implements VentaApiPort {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async enviarVenta(request: SaleRequest): Promise<SaleResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/ventas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      // 201 Created - Venta creada exitosamente
      if (response.status === 201) {
        const data = await response.json();
        return data as SaleResponse;
      }

      // 200 OK - Respuesta idempotente (clientTransactionId ya procesado)
      if (response.status === 200) {
        const data = await response.json();
        return data as SaleResponse;
      }

      // 400 Bad Request - Solicitud inválida
      if (response.status === 400) {
        throw {
          codigo: ErrorCode.VALIDACION_FALLIDA,
          mensaje: 'Solicitud inválida. Revise los datos del carrito.',
        } as ApiError;
      }

      // 422 Unprocessable Entity - Error de validación de negocio
      if (response.status === 422) {
        const errorBody = await response.json();
        throw {
          codigo: errorBody.codigo || ErrorCode.VALIDACION_FALLIDA,
          mensaje: errorBody.mensaje || 'Error de validación',
          campo: errorBody.campo,
        } as ApiError;
      }

      // 503 Service Unavailable - Servicio de stock no disponible
      if (response.status === 503) {
        throw {
          codigo: ErrorCode.SERVICIO_STOCK_NO_DISPONIBLE,
          mensaje: 'Servicio de stock no disponible. Contacte al administrador.',
        } as ApiError;
      }

      // 500 Internal Server Error - Error de persistencia
      if (response.status === 500) {
        throw {
          codigo: ErrorCode.ERROR_PERSISTENCIA,
          mensaje: 'Error al procesar la venta. Puede reintentar de forma segura.',
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
        mensaje: 'Error de conexión. Verifique su red.',
      } as ApiError;
    }
  }
}
