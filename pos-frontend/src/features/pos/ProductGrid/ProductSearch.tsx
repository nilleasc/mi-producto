import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Product } from '../../../core/entities/Product';
import { apiClient } from '../../../infrastructure/http/apiClient';

const normalize = (str: string) =>
  str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

interface ProductSearchProps {
  onSearch: (query: string, results?: Product[]) => void;
  onBarcodeScan: (barcode: string) => void;
  products?: Product[];
  onSelectSuggestion?: (product: Product) => void;
}

export const ProductSearch: React.FC<ProductSearchProps> = ({
  onSearch, onBarcodeScan, products = [], onSelectSuggestion,
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mapear producto del backend al formato del frontend
  const mapProduct = (item: any): Product => ({
    id: item.id,
    sku: item.sku || item.barcode || 'N/A',
    name: item.name,
    price: typeof item.price === 'number' ? { amount: Number(item.price), currency: 'COP' } as any : item.price,
    stock: Number(item.stock),
    categoryId: item.categoryId || 'c1',
    variants: item.variants || [],
    isActive: item.active !== false && item.isActive !== false,
    imageUrl: item.imageUrl || null,
    unitOfMeasure: item.unitOfMeasure || 'UND',
  });

  // Búsqueda contra el backend — cada tecla genera una petición visible en Network
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!query.trim()) { setSuggestions([]); setIsOpen(false); onSearch(''); return; }
      try {
        const raw: any[] = await apiClient.get(`/api/products/search?q=${encodeURIComponent(query.trim())}`);
        const results: Product[] = raw.map(mapProduct);
        const limited = results.slice(0, 7);
        setSuggestions(limited);
        setIsOpen(limited.length > 0);
        setActiveIndex(-1);
        onSearch(query, results);
      } catch (err) {
        console.error('Error buscando productos:', err);
        // Fallback local por si el backend no responde
        const q = normalize(query);
        const local = products.filter(p => normalize(p.name).includes(q) || normalize(String(p.sku)).includes(q)).slice(0, 7);
        setSuggestions(local);
        setIsOpen(local.length > 0);
        setActiveIndex(-1);
        onSearch(query, local);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, products, onSearch]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) { setIsOpen(false); setActiveIndex(-1); }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      (listRef.current.children[activeIndex] as HTMLElement)?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  const selectSuggestion = useCallback((product: Product) => {
    setQuery(product.name);
    setIsOpen(false);
    setActiveIndex(-1);
    onSelectSuggestion?.(product);
    inputRef.current?.focus();
  }, [onSelectSuggestion]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isOpen && suggestions.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(p => p < suggestions.length - 1 ? p + 1 : 0); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(p => p > 0 ? p - 1 : suggestions.length - 1); return; }
      if (e.key === 'Tab') { e.preventDefault(); const t = activeIndex >= 0 ? suggestions[activeIndex] : suggestions[0]; if (t) selectSuggestion(t); return; }
      if (e.key === 'Enter') { e.preventDefault(); if (activeIndex >= 0 && suggestions[activeIndex]) selectSuggestion(suggestions[activeIndex]); else if (query.length > 5) { onBarcodeScan(query); setQuery(''); setIsOpen(false); } return; }
      if (e.key === 'Escape') { setIsOpen(false); setActiveIndex(-1); return; }
    } else if (e.key === 'Enter' && query.length > 5) { e.preventDefault(); onBarcodeScan(query); setQuery(''); }
  };

  const formattedPrice = (product: Product) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format((product.price as any).amount);

  const highlightMatch = (text: string) => {
    if (!query.trim()) return text;
    const idx = normalize(text).indexOf(normalize(query));
    if (idx === -1) return text;
    return <>{text.slice(0, idx)}<mark className="bg-orange-100 text-orange-700 font-semibold rounded-sm px-0.5 not-italic">{text.slice(idx, idx + query.length)}</mark>{text.slice(idx + query.length)}</>;
  };

  return (
    <div className="w-full relative" ref={containerRef}>
      {/* Campo de búsqueda — tarjeta blanca flotante con sombra suave */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          ref={inputRef}
          id="product-search-input"
          type="text"
          className={`w-full py-4 pl-12 pr-11 text-slate-800 placeholder-slate-400 text-sm font-medium bg-white outline-none transition-all duration-200
            ${isOpen
              ? 'rounded-t-2xl rounded-b-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-b-0 border-orange-300 ring-0'
              : 'rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] border border-transparent hover:border-slate-200 focus:border-orange-300 focus:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)]'
            }`}
          placeholder="Buscar por nombre, SKU o escanear código de barras…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          autoFocus
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls="search-suggestions"
          aria-activedescendant={activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined}
          role="combobox"
          aria-expanded={isOpen}
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); setSuggestions([]); setIsOpen(false); onSearch(''); inputRef.current?.focus(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            aria-label="Limpiar búsqueda"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown de sugerencias */}
      {isOpen && suggestions.length > 0 && (
        <ul
          id="search-suggestions"
          ref={listRef}
          role="listbox"
          className="absolute left-0 right-0 z-50 bg-white border border-t-0 border-orange-300 rounded-b-2xl shadow-[0_12px_32px_-8px_rgba(0,0,0,0.12)] overflow-hidden max-h-72 overflow-y-auto"
        >
          {suggestions.map((product, index) => {
            const isActive = index === activeIndex;
            const isOut = product.stock <= 0;
            return (
              <li
                key={product.id}
                id={`suggestion-${index}`}
                role="option"
                aria-selected={isActive}
                className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors select-none
                  ${isActive ? 'bg-orange-50' : 'hover:bg-slate-50'}
                  ${index < suggestions.length - 1 ? 'border-b border-slate-50' : ''}
                  ${isOut ? 'opacity-50' : ''}`}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(-1)}
                onMouseDown={(e) => { e.preventDefault(); if (!isOut) selectSuggestion(product); }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-black transition-colors
                    ${isActive ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {product.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{highlightMatch(product.name)}</p>
                    <p className="text-xs text-slate-400 font-mono">SKU: {String(product.sku)}{isOut && <span className="ml-2 text-red-400 font-sans not-italic">· Sin stock</span>}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  <span className="text-sm font-bold text-slate-900">{formattedPrice(product)}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold
                    ${product.stock <= 0 ? 'bg-red-50 text-red-500' : product.stock < 5 ? 'bg-orange-50 text-orange-500' : 'bg-green-50 text-green-600'}`}>
                    {product.stock} uds
                  </span>
                  {isActive && <kbd className="text-[9px] px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-slate-500 shadow-sm">↵</kbd>}
                </div>
              </li>
            );
          })}
          <li className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-100 flex items-center gap-3 text-[10px] text-slate-400 font-medium">
            {[['↑↓', 'Navegar'], ['↵', 'Selec.'], ['Tab', 'Primero'], ['Esc', 'Cerrar']].map(([key, label]) => (
              <span key={key} className="flex items-center gap-1">
                <kbd className="px-1.5 bg-white border border-slate-200 rounded font-mono shadow-sm text-slate-500">{key}</kbd> {label}
              </span>
            ))}
          </li>
        </ul>
      )}
    </div>
  );
};
