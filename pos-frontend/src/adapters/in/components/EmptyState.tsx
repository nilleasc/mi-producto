'use client';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Componente para estados vacíos
 * 
 * Muestra un mensaje amigable cuando no hay datos disponibles.
 */
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && <div className="mb-4 text-gray-400">{icon}</div>}
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-600 mb-6 max-w-md">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

/**
 * Empty state para carrito vacío
 */
export function EmptyCart() {
  return (
    <EmptyState
      icon={
        <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      }
      title="Carrito vacío"
      description="Busca y agrega productos para comenzar una venta"
    />
  );
}

/**
 * Empty state para búsqueda sin resultados
 */
export function NoSearchResults({ query }: { query: string }) {
  return (
    <EmptyState
      icon={
        <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      }
      title="No se encontraron resultados"
      description={`No se encontró ningún producto con el ID "${query}"`}
    />
  );
}

/**
 * Empty state para error de conexión
 */
export function ConnectionError({ onRetry }: { onRetry: () => void }) {
  return (
    <EmptyState
      icon={
        <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
          />
        </svg>
      }
      title="Error de conexión"
      description="No se pudo conectar con el servidor. Verifica tu conexión a internet."
      action={{
        label: 'Reintentar',
        onClick: onRetry,
      }}
    />
  );
}
