'use client';

import { useEffect, useRef } from 'react';
import { CartItem } from '../../../domain/cart/CartItem';
import { calcularUmbralDescuento } from '../../../domain/logic/priceValidation';

interface DiscountConfirmationDialogProps {
  items: CartItem[];
  onConfirm: () => void;
  onCancel: () => void;
}

export function DiscountConfirmationDialog({
  items,
  onConfirm,
  onCancel,
}: DiscountConfirmationDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap y manejo de Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }

      // Focus trap
      if (e.key === 'Tab') {
        const focusableElements = dialogRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    firstButtonRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onCancel]);

  // Calcular porcentaje de descuento
  const calcularPorcentajeDescuento = (precioOverride: number, precioOficial: number): number => {
    return Math.round(((precioOficial - precioOverride) / precioOficial) * 100);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div
        ref={dialogRef}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-orange-50 border-b border-orange-200 p-6">
          <div className="flex items-center gap-3">
            <svg
              className="h-8 w-8 text-orange-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h2 id="dialog-title" className="text-xl font-bold text-orange-900">
              Confirmación de Descuentos Elevados
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Los siguientes productos tienen descuentos <strong>mayores al 30%</strong>. Por favor,
            revisa y confirma antes de continuar:
          </p>

          <div className="space-y-3 mb-6">
            {items.map((item) => {
              const umbral = calcularUmbralDescuento(item.precioOficial);
              const porcentaje = item.precioOverride
                ? calcularPorcentajeDescuento(item.precioOverride, item.precioOficial)
                : 0;

              return (
                <div
                  key={item.productoId}
                  className="bg-orange-50 border border-orange-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-800">{item.nombreProducto}</h3>
                      <p className="text-xs text-gray-500">{item.productoId}</p>
                    </div>
                    <span className="bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {porcentaje}% OFF
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Precio oficial:</p>
                      <p className="font-semibold text-gray-800">
                        ${item.precioOficial.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Precio modificado:</p>
                      <p className="font-semibold text-orange-600">
                        ${item.precioOverride?.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Umbral mínimo (70%):</p>
                      <p className="font-semibold text-gray-800">${umbral.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Autorizado por:</p>
                      <p className="font-semibold text-gray-800">
                        {item.autorizadoPor || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Nota:</strong> Estos descuentos requieren autorización especial. Asegúrate de
              que todos los precios modificados estén correctamente autorizados antes de proceder.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 p-6 flex gap-3 justify-end">
          <button
            ref={firstButtonRef}
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors font-medium"
          >
            Confirmar y Continuar
          </button>
        </div>
      </div>
    </div>
  );
}
