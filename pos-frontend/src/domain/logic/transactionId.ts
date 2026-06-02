/**
 * Genera un UUID v4 único para identificar una transacción
 * 
 * Utiliza crypto.randomUUID() para generar un identificador único
 * que se usa para garantizar idempotencia en las solicitudes de venta.
 * 
 * El mismo clientTransactionId debe reutilizarse en todos los reintentos
 * de una misma transacción.
 * 
 * @returns UUID v4 como string
 */
export function generarClientTransactionId(): string {
  return crypto.randomUUID();
}
