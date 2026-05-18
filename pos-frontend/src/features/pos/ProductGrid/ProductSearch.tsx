import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Product } from '../../../core/entities/Product';

/** Elimina tildes y diacríticos para búsqueda sin acento */
const normalize = (str: string) =>
  str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

interface ProductSearchProps {
  onSearch: (query: string) => void;
  onBarcodeScan: (barcode: string) => void;
  /** Lista completa de productos para generar sugerencias */
  products?: Product[];
  /** Callback cuando el usuario selecciona una sugerencia */
  onSelectSuggestion?: (product: Product) => void;
}

export const ProductSearch: React.FC<ProductSearchProps> = ({
  onSearch,
  onBarcodeScan,
  products = [],
  onSelectSuggestion,
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generar sugerencias cuando cambia el query
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!query.trim()) {
        setSuggestions([]);
        setIsOpen(false);
        onSearch('');
        return;
      }
      const q = normalize(query);
      const results = products
        .filter(
          (p) =>
            normalize(p.name).includes(q) ||
            normalize(String(p.sku)).includes(q),
        )
        .slice(0, 7); // máx 7 sugerencias

      setSuggestions(results);
      setIsOpen(results.length > 0);
      setActiveIndex(-1);
      onSearch(query);
    }, 200);
    return () => clearTimeout(timer);
  }, [query, products, onSearch]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll automático al ítem activo
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const item = listRef.current.children[activeIndex] as HTMLElement;
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  const selectSuggestion = useCallback(
    (product: Product) => {
      setQuery(product.name);
      setIsOpen(false);
      setActiveIndex(-1);
      onSelectSuggestion?.(product);
      inputRef.current?.focus();
    },
    [onSelectSuggestion],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Navegación con flechas dentro del dropdown
    if (isOpen && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
        return;
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        // Tab selecciona la primera sugerencia o la activa
        const target = activeIndex >= 0 ? suggestions[activeIndex] : suggestions[0];
        if (target) selectSuggestion(target);
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (activeIndex >= 0 && suggestions[activeIndex]) {
          selectSuggestion(suggestions[activeIndex]);
        } else if (query.length > 5) {
          // Sin selección activa → tratar como código de barras
          onBarcodeScan(query);
          setQuery('');
          setIsOpen(false);
        }
        return;
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        setActiveIndex(-1);
        return;
      }
    } else if (e.key === 'Enter' && query.length > 5) {
      e.preventDefault();
      onBarcodeScan(query);
      setQuery('');
    }
  };

  const formattedPrice = (product: Product) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format((product.price as any).amount);

  const highlightMatch = (text: string) => {
    if (!query.trim()) return text;
    const normalizedText = normalize(text);
    const normalizedQuery = normalize(query);
    const idx = normalizedText.indexOf(normalizedQuery);
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-blue-100 text-blue-800 font-semibold rounded px-0.5">
          {text.slice(idx, idx + query.length)}
        </mark>
        {text.slice(idx + query.length)}
      </>
    );
  };

  return (
    <div className="w-full relative" ref={containerRef}>
      {/* Input */}
      <div className="relative">
        {/* Icono lupa */}
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>

        <input
          ref={inputRef}
          id="product-search-input"
          type="text"
          className={`w-full py-3.5 pl-12 pr-12 border-2 text-gray-900 text-base font-medium shadow-sm transition-all duration-200 bg-white
            ${isOpen
              ? 'border-blue-500 ring-2 ring-blue-100 rounded-t-xl rounded-b-none'
              : 'border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
            }`}
          placeholder="Buscar producto por nombre, SKU o escanear código de barras…"
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

        {/* Botón limpiar */}
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSuggestions([]);
              setIsOpen(false);
              onSearch('');
              inputRef.current?.focus();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            aria-label="Limpiar búsqueda"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
          className="absolute left-0 right-0 z-50 bg-white border-2 border-t-0 border-blue-500 rounded-b-xl shadow-xl overflow-hidden max-h-80 overflow-y-auto"
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
                className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors duration-100 select-none
                  ${isActive ? 'bg-blue-50' : 'hover:bg-gray-50'}
                  ${index < suggestions.length - 1 ? 'border-b border-gray-100' : ''}
                  ${isOut ? 'opacity-50' : ''}
                `}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(-1)}
                onMouseDown={(e) => {
                  e.preventDefault(); // evitar que el input pierda foco antes del click
                  if (!isOut) selectSuggestion(product);
                }}
              >
                {/* Info del producto */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* Icono de producto */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold
                    ${isActive ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {product.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {highlightMatch(product.name)}
                    </p>
                    <p className="text-xs text-gray-400 font-mono">
                      SKU: {String(product.sku)}
                      {isOut && <span className="ml-2 text-red-500 font-sans">· Sin stock</span>}
                    </p>
                  </div>
                </div>

                {/* Precio + stock */}
                <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                  <span className="text-sm font-bold text-gray-800">{formattedPrice(product)}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium
                    ${product.stock <= 0 ? 'bg-red-100 text-red-600' :
                      product.stock < 5 ? 'bg-orange-100 text-orange-600' :
                      'bg-green-100 text-green-700'}`}>
                    {product.stock} uds
                  </span>
                  {/* Indicador de atajo de teclado para el ítem activo */}
                  {isActive && (
                    <kbd className="text-[10px] px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded font-mono text-gray-500">
                      ↵
                    </kbd>
                  )}
                </div>
              </li>
            );
          })}

          {/* Pie del dropdown: hint de atajos */}
          <li className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center gap-4 text-[10px] text-gray-400 font-medium">
            <span className="flex items-center gap-1">
              <kbd className="px-1 bg-white border border-gray-300 rounded font-mono">↑↓</kbd> Navegar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 bg-white border border-gray-300 rounded font-mono">↵</kbd> Seleccionar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 bg-white border border-gray-300 rounded font-mono">Tab</kbd> Primero
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 bg-white border border-gray-300 rounded font-mono">Esc</kbd> Cerrar
            </span>
          </li>
        </ul>
      )}
    </div>
  );
};
