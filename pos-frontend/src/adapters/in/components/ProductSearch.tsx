'use client';

import { useState } from 'react';
import { useProductSearch } from '../../../application/useProductSearch';

interface ProductSearchProps {
  onProductFound: (productoId: string, nombreProducto: string, precioOficial: number) => void;
}

export function ProductSearch({ onProductFound }: ProductSearchProps) {
  const { resultado, cargando, error, puedeReintentar, buscar, limpiar } = useProductSearch();
  const [inputValue, setInputValue] = useState('');
  const [cantidad, setCantidad] = useState(1);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      await buscar(inputValue.trim());
    }
  };

  const handleAddToCart = () => {
    if (resultado) {
      onProductFound(resultado.productoId, resultado.nombre, resultado.precioOficial);
      // Limpiar búsqueda tras agregar
      setInputValue('');
      setCantidad(1);
      limpiar();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Buscar Producto</h2>
      
      <form onSubmit={handleSearch} className="space-y-4">
        <div>
          <label htmlFor="producto-id" className="block text-sm font-medium text-gray-700 mb-2">
            ID del Producto
          </label>
          <input
            id="producto-id"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ej: PROD-001"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={cargando}
          />
        </div>

        <button
          type="submit"
          disabled={cargando || !inputValue.trim()}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {cargando ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {/* Resultado de búsqueda */}
      {resultado && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <h3 className="font-semibold text-green-800 mb-2">Producto encontrado</h3>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">ID:</span> {resultado.productoId}</p>
            <p><span className="font-medium">Nombre:</span> {resultado.nombre}</p>
            <p><span className="font-medium">Precio:</span> ${resultado.precioOficial.toFixed(2)}</p>
          </div>

          <div className="mt-4">
            <label htmlFor="cantidad" className="block text-sm font-medium text-gray-700 mb-2">
              Cantidad
            </label>
            <input
              id="cantidad"
              type="number"
              min="1"
              value={cantidad}
              onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleAddToCart}
            className="w-full mt-4 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
          >
            Agregar al Carrito
          </button>
        </div>
      )}

      {/* Errores */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{error}</p>
          {puedeReintentar && (
            <button
              onClick={() => buscar(inputValue)}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Reintentar
            </button>
          )}
        </div>
      )}
    </div>
  );
}
