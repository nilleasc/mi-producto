'use client';

import { useState } from 'react';
import { useDependencies } from '../infrastructure/di/DependencyProvider';
import { Product } from '../domain/product/Product';
import { ApiError } from '../domain/errors/Errors';

export function useProductSearch() {
  const { productoApi } = useDependencies();
  const [query, setQuery] = useState('');
  const [resultado, setResultado] = useState<Product | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [puedeReintentar, setPuedeReintentar] = useState(false);

  const buscar = async (productoId: string) => {
    setQuery(productoId);
    setError(null);
    setResultado(null);
    setPuedeReintentar(false);
    setCargando(true);

    try {
      const producto = await productoApi.consultarPrecio(productoId);
      setResultado(producto);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.mensaje);
      
      // Permitir reintento en errores 500 o de red
      if (apiError.codigo === 'ERROR_RED' || apiError.codigo === 'ERROR_PERSISTENCIA') {
        setPuedeReintentar(true);
      }
    } finally {
      setCargando(false);
    }
  };

  const limpiar = () => {
    setQuery('');
    setResultado(null);
    setError(null);
    setPuedeReintentar(false);
    setCargando(false);
  };

  return {
    query,
    resultado,
    cargando,
    error,
    puedeReintentar,
    buscar,
    limpiar,
  };
}
