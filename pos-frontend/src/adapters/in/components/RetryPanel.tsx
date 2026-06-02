'use client';

import { useState, useEffect } from 'react';

interface RetryPanelProps {
  message: string;
  onRetry: () => void;
  countdown?: number; // segundos
  isRetrying?: boolean;
}

/**
 * Panel de reintento con countdown opcional
 * 
 * Muestra un mensaje de error con botón de reintento
 * y opcionalmente un countdown automático.
 */
export function RetryPanel({ message, onRetry, countdown, isRetrying = false }: RetryPanelProps) {
  const [secondsLeft, setSecondsLeft] = useState(countdown);

  useEffect(() => {
    if (!countdown || !secondsLeft || secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (!prev || prev <= 1) {
          clearInterval(timer);
          onRetry();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, secondsLeft, onRetry]);

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <div className="flex justify-center mb-4">
        <svg
          className="h-12 w-12 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <h3 className="text-lg font-semibold text-red-900 mb-2">Error al procesar</h3>
      <p className="text-sm text-red-700 mb-6">{message}</p>

      <button
        onClick={onRetry}
        disabled={isRetrying}
        className="bg-red-600 text-white py-2 px-6 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium inline-flex items-center gap-2"
      >
        {isRetrying ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
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
            Reintentando...
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Reintentar
            {secondsLeft && secondsLeft > 0 && ` (${secondsLeft}s)`}
          </>
        )}
      </button>
    </div>
  );
}
