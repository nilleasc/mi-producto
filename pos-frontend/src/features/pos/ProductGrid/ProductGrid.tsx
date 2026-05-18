import React, { useState, useEffect } from 'react';
import { ProductSearch } from './ProductSearch';
import { ProductCard } from './ProductCard';
import { Product } from '../../../core/entities/Product';
import { useInventoryStore } from '../../../adapters/state/inventoryStore';

const normalize = (str: string) =>
  str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

interface ProductGridProps {
  onAddToCart: (product: Product, quantity: number) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ onAddToCart }) => {
  const { products } = useInventoryStore();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredProducts([]);
      setHasSearched(false);
      return;
    }
    const q = normalize(query);
    const results = products.filter(
      (p) =>
        normalize(p.name).includes(q) ||
        normalize(String(p.sku)).includes(q),
    );
    setFilteredProducts(results);
    setHasSearched(true);
  };

  const handleBarcodeScan = (barcode: string) => {
    const product = products.find((p) => (p.sku as unknown as string) === barcode);
    if (product && product.stock > 0) {
      onAddToCart(product, 1);
    }
  };

  // Selección directa desde el autocomplete → agrega al carrito inmediatamente
  const handleSelectSuggestion = (product: Product) => {
    if (product.stock > 0) {
      onAddToCart(product, 1);
    }
    // Actualiza el grid también para mostrar el producto seleccionado
    setFilteredProducts([product]);
    setHasSearched(true);
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <ProductSearch
        onSearch={handleSearch}
        onBarcodeScan={handleBarcodeScan}
        products={products}
        onSelectSuggestion={handleSelectSuggestion}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pb-20">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAdd={(p) => onAddToCart(p, 1)}
          />
        ))}
        {!hasSearched && (
          <div className="col-span-full text-center text-gray-500 py-10">
            Ingresa el nombre o código del producto para buscar.
          </div>
        )}
        {hasSearched && filteredProducts.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-10">
            No se encontraron productos.
          </div>
        )}
      </div>
    </div>
  );
};
