import { DomainError, ErrorCode } from '../errors/Errors';
import { redondeoHalfUp } from './cartCalculations';

/**
 * Calcula el umbral de descuento (70% del precio oficial)
 * 
 * Retorna el 70% del precio oficial redondeado con HALF_UP a 2 decimales.
 * Si el precio override es menor a este umbral, requiere confirmación explícita.
 * 
 * @param precioOficial - Precio oficial del producto
 * @returns Umbral de descuento (70% del precio oficial)
 */
export function calcularUmbralDescuento(precioOficial: number): number {
  return redondeoHalfUp(precioOficial * 0.70, 2);
}

/**
 * Valida un precio override
 * 
 * Verifica que:
 * 1. El precio override sea mayor que cero
 * 2. Si el precio override está presente, autorizadoPor debe estar presente
 * 
 * @param precioOverride - Precio alternativo ingresado
 * @param precioOficial - Precio oficial del producto
 * @param autorizadoPor - Identificador del supervisor que autoriza (opcional)
 * @returns DomainError si la validación falla, undefined si es válido
 */
export function validarPrecioOverride(
  precioOverride: number,
  precioOficial: number,
  autorizadoPor?: string
): DomainError | undefined {
  // Validar que el precio override sea mayor que cero
  if (precioOverride <= 0) {
    return {
      codigo: ErrorCode.VALIDACION_FALLIDA,
      mensaje: 'El precio override debe ser mayor que cero',
    };
  }
  
  // Validar que autorizadoPor esté presente cuando hay precio override
  if (!autorizadoPor || autorizadoPor.trim() === '') {
    return {
      codigo: ErrorCode.VALIDACION_FALLIDA,
      mensaje: 'Se requiere autorización para el precio modificado',
    };
  }
  
  // Validación exitosa
  return undefined;
}
