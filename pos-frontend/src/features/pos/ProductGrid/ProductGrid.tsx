import React, { useState } from 'react';
import { ProductSearch } from './ProductSearch';
import { ProductCard } from './ProductCard';
import { Product } from '../../../core/entities/Product';
import { useInventoryStore } from '../../../adapters/state/inventoryStore';

interface ProductGridProps {
  onAddToCart: (product: Product, quantity: number) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ onAddToCart }) => {
  const { products } = useInventoryStore();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Recibe resultados directamente del backend (o fallback local)
  const handleSearch = (query: string, results?: Product[]) => {
    if (!query.trim()) { setFilteredProducts([]); setHasSearched(false); return; }
    setFilteredProducts(results || []);
    setHasSearched(true);
  };

  const handleBarcodeScan = (barcode: string) => {
    const product = products.find((p) => (p.sku as unknown as string) === barcode);
    if (product && product.stock > 0) onAddToCart(product, 1);
  };

  const handleSelectSuggestion = (product: Product) => {
    if (product.stock > 0) onAddToCart(product, 1);
    setFilteredProducts([product]);
    setHasSearched(true);
  };

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Buscador: tarjeta blanca flotante */}
      <div className="flex-shrink-0">
        <ProductSearch
          onSearch={handleSearch}
          onBarcodeScan={handleBarcodeScan}
          products={products}
          onSelectSuggestion={handleSelectSuggestion}
        />
      </div>

      {/* Grid de productos directamente sobre el fondo */}
      <div className="flex-1 overflow-y-auto">
        {!hasSearched ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-500">Busca un producto</p>
              <p className="text-xs text-slate-400 mt-0.5">Nombre, código SKU o escanea con el lector</p>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-500">Sin resultados</p>
              <p className="text-xs text-slate-400 mt-0.5">Intenta con otro término</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 pb-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAdd={(p) => onAddToCart(p, 1)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
