import { SaleRequest } from '../sale/Sale';
import { SaleResponse } from '../sale/Sale';

/**
 * Puerto para enviar ventas al backend
 * 
 * Abstrae el envío de una venta al backend sin ninguna referencia
 * a implementaciones concretas de red (fetch, axios, etc.).
 * 
 * Esta interfaz define el contrato que debe cumplir cualquier adaptador
 * que implemente la comunicación con el backend de ventas.
 */
export interface VentaApiPort {
  /**
   * Envía una venta al backend
   * 
   * @param request - Solicitud de venta con items y clientTransactionId opcional
   * @returns Promise que resuelve con SaleResponse en caso de éxito
   * @throws ApiError con el código correspondiente en caso de error HTTP o de red
   */
  enviarVenta(request: SaleRequest): Promise<SaleResponse>;
}
