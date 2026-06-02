'use client';

import { calcularUmbralDescuento } from '../domain/logic/priceValidation';

interface PriceOverrideResult {
  precioAplicado: number;
  umbralDescuento: number;
  overrideBajoUmbral: boolean;
  requiereConfirmacion: boolean;
}

export function usePriceOverride(
  productoId: string,
  precioOverride: number | undefined,
  precioOficial: number
): PriceOverrideResult {
  const umbralDescuento = calcularUmbralDescuento(precioOficial);
  const overrideBajoUmbral = precioOverride !== undefined && precioOverride < umbralDescuento;
  const precioAplicado = precioOverride ?? precioOficial;
  const requiereConfirmacion = overrideBajoUmbral && precioOverride !== undefined;

  return {
    precioAplicado,
    umbralDescuento,
    overrideBajoUmbral,
    requiereConfirmacion,
  };
}
