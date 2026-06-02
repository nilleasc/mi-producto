'use client';

import { CartState } from '../../../domain/cart/CartState';

interface CheckoutButtonProps {
  estado: CartState;
  disabled: boolean;
  onClick: () => void;
}

export function CheckoutButton({ estado, disabled, onClick }: CheckoutButtonProps) {
  const isProcessing = estado === CartState.PROCESANDO;

  return (
    <button
      onClick={onClick}
      disabled={disabled || isProcessing}
      aria-busy={isProcessing}
      aria-label={isProcessing ? 'Procesando pago...' : 'Procesar pago'}
      className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-bold text-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-lg"
    >
      {isProcessing ? (
        <span className="flex items-center justify-center gap-2">
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Procesando...
        </span>
      ) : (
        'Procesar Pago'
      )}
    </button>
  );
}
