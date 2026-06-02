/**
 * Configuracion AWS
 *
 * PLACEHOLDER - Solo define la estructura de configuracion.
 * NO contiene credenciales reales.
 * NO realiza llamadas a AWS.
 */

export interface AwsConfig {
  region: string;
  dynamodb: {
    productosTable: string;
    ventasTable: string;
    endpoint?: string;
  };
  apiGateway: {
    url: string;
    apiKey?: string;
  };
}

/**
 * Configuracion por defecto (sin credenciales)
 * Los valores reales deben venir de variables de entorno.
 */
export const defaultAwsConfig: AwsConfig = {
  region: process.env.NEXT_PUBLIC_AWS_REGION ?? 'us-east-1',
  dynamodb: {
    productosTable: process.env.NEXT_PUBLIC_DYNAMODB_PRODUCTOS_TABLE ?? 'pos-productos',
    ventasTable: process.env.NEXT_PUBLIC_DYNAMODB_VENTAS_TABLE ?? 'pos-ventas',
    endpoint: process.env.NEXT_PUBLIC_DYNAMODB_ENDPOINT,
  },
  apiGateway: {
    url: process.env.NEXT_PUBLIC_API_GATEWAY_URL ?? '',
    apiKey: process.env.NEXT_PUBLIC_API_GATEWAY_KEY,
  },
};