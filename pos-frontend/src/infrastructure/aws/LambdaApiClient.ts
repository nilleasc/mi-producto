/**
 * Cliente para API Gateway + Lambda
 * 
 * PLACEHOLDER - NO IMPLEMENTADO
 * 
 * Este archivo prepara la estructura para futura integración con Lambda.
 * NO contiene credenciales ni llamadas reales a AWS.
 */

import { SaleRequest, SaleResponse } from '../../domain/sale/Sale';
import { VentaApiPort } from '../../domain/ports/VentaApiPort';
import { ApiError, ErrorCode } from '../../domain/errors/Errors';

/**
 * Configuración de Lambda API
 */
export interface LambdaApiConfig {
  apiGatewayUrl: string;
  region: string;
  apiKey?: string;
}

/**
 * Cliente para Lambda functions via API Gateway
 * 
 * IMPORTANTE: Esta es una implementación placeholder.
 * NO realiza llamadas reales a AWS Lambda.
 */
export class LambdaApiClient implements VentaApiPort {
  private config: LambdaApiConfig;

  constructor(config: LambdaApiConfig) {
    this.config = config;
    console.warn('LambdaApiClient: Placeholder mode - No real AWS calls');
  }

  /**
   * Envía una venta a Lambda
   * 
   * PLACEHOLDER - Retorna error indicando que no está implementado
   */
  async enviarVenta(request: SaleRequest): Promise<SaleResponse> {
    throw {
      codigo: ErrorCode.ERROR_PERSISTENCIA,
      mensaje: 'Lambda integration not implemented yet',
    } as ApiError;
  }

  /**
   * Métodos privados para futura implementación
   */

  // private async invokeLambda(functionName: string, payload: any): Promise<any> {
  //   // TODO: Implementar con AWS SDK
  //   // const result = await lambdaClient.invoke({
  //   //   FunctionName: functionName,
  //   //   Payload: JSON.stringify(payload)
  //   // });
  //   return null;
  // }

  // private async callApiGateway(endpoint: string, method: string, body: any): Promise<any> {
  //   // TODO: Implementar con fetch + AWS Signature V4
  //   // const response = await fetch(`${this.config.apiGatewayUrl}${endpoint}`, {
  //   //   method,
  //   //   headers: {
  //   //     'Content-Type': 'application/json',
  //   //     'x-api-key': this.config.apiKey
  //   //   },
  //   //   body: JSON.stringify(body)
  //   // });
  //   return null;
  // }
}

/**
 * Factory function para crear el cliente
 */
export const createLambdaApiClient = (
  config: LambdaApiConfig
): LambdaApiClient => {
  return new LambdaApiClient(config);
};
