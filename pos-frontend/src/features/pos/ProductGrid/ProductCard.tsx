import React from 'react';
import { Product } from '../../../core/entities/Product';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd }) => {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock < 5;

  const formattedPrice = new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0,
  }).format((product.price as any).amount);

  return (
    <div
      className={`relative flex flex-col bg-white rounded-2xl p-4 border border-transparent
        shadow-[0_1px_8px_-2px_rgba(0,0,0,0.06)]
        hover:shadow-[0_6px_24px_-6px_rgba(0,0,0,0.1)] hover:border-orange-100
        transition-all duration-200 ease-out group
        ${isOutOfStock ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer hover:-translate-y-0.5'}`}
      onClick={() => !isOutOfStock && onAdd(product)}
    >
      {/* Badges superior */}
      <div className="flex items-start justify-between mb-3">
        <span className="text-[9px] font-black tracking-widest text-orange-500 uppercase bg-orange-50 px-2 py-0.5 rounded-full">
          {(product as any).categoryId || 'General'}
        </span>
        {isOutOfStock
          ? <span className="text-[9px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Agotado</span>
          : isLowStock
          ? <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Pocas uds.</span>
          : null
        }
      </div>

      {/* Nombre */}
      <h3 className="font-bold text-sm text-slate-900 leading-snug flex-1 mb-3 group-hover:text-orange-600 transition-colors">
        {product.name}
      </h3>

      {/* Pie de tarjeta */}
      <div className="border-t border-slate-50 pt-3 flex items-end justify-between">
        <div>
          <div className="text-lg font-black text-slate-900 leading-none">{formattedPrice}</div>
          <div className="text-[10px] text-slate-400 mt-1">
            Stock: <span className={isLowStock ? 'text-amber-500 font-bold' : 'text-slate-500 font-medium'}>{product.stock}</span>
          </div>
        </div>
        {!isOutOfStock && (
          <div className="w-8 h-8 rounded-xl bg-orange-500 group-hover:bg-orange-600 flex items-center justify-center text-white shadow-sm shadow-orange-200 transition-colors flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
        )}
      </div>

      {/* SKU */}
      <div className="mt-2">
        <span className="text-[9px] font-mono text-slate-300 bg-slate-50 px-1.5 py-0.5 rounded">SKU: {String(product.sku)}</span>
      </div>
    </div>
  );
};
