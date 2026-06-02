'use client';

import { useTerminalDeVenta } from '../../../application/useTerminalDeVenta';
import { TerminalState } from '../../../domain/terminal/TerminalState';
import { ProductSearch } from '../components/ProductSearch';
import { CartPanel } from '../components/CartPanel';
import { CheckoutButton } from '../components/CheckoutButton';
import { SaleReceipt } from '../components/SaleReceipt';
import { DiscountConfirmationDialog } from '../components/DiscountConfirmationDialog';
import { OfflineBanner } from '../components/OfflineBanner';
import { CartState } from '../../../domain/cart/CartState';

/**
 * Página principal del Terminal de Venta
 * 
 * SIMPLIFICADA - Solo composición de componentes.
 * Toda la lógica está en useTerminalDeVenta.
 */
export function PosPage() {
  const terminal = useTerminalDeVenta();

  // Vista de recibo tras venta exitosa
  if (terminal.state.currentState === TerminalState.SALE_COMPLETED && terminal.saleResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <SaleReceipt venta={terminal.saleResult} onNewSale={terminal.actions.startNewSale} />
      </div>
    );
  }

  // Vista principal del POS
  return (
    <>
      {/* Banner offline/degradado */}
      <OfflineBanner
        visible={terminal.state.isDegraded}
        mode="degraded"
        message="Servicio de stock no disponible. La venta se procesará pero no se actualizará el inventario."
      />

      {/* Diálogo de confirmación de descuentos */}
      {terminal.requiresDiscountConfirmation && (
        <DiscountConfirmationDialog
          items={terminal.itemsWithDiscount}
          onConfirm={terminal.actions.confirmDiscount}
          onCancel={terminal.actions.cancelDiscount}
        />
      )}

      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Terminal de Venta (POS)</h1>
            <p className="text-gray-600 mt-1">
              Sistema de punto de venta - Arquitectura Hexagonal
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Sesión: {terminal.session.sessionId} | Estado: {terminal.state.currentState}
            </p>
          </header>

          {/* Layout principal: 3 columnas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna izquierda: Búsqueda */}
            <div className="lg:col-span-1">
              <ProductSearch
                onProductFound={(productoId, nombreProducto, precioOficial) => {
                  if (terminal.searchResult) {
                    terminal.actions.addProductToCart(terminal.searchResult, 1);
                  }
                }}
              />
            </div>

            {/* Columna derecha: Carrito */}
            <div className="lg:col-span-2">
              <CartPanel
                cart={terminal.cart}
                onUpdateQuantity={terminal.actions.updateQuantity}
                onRemoveItem={terminal.actions.removeItem}
                onUpdatePriceOverride={terminal.actions.updatePriceOverride}
              />

              {/* Botón de checkout */}
              {terminal.cart.items.length > 0 && (
                <div className="mt-6">
                  <CheckoutButton
                    estado={terminal.isProcessing ? CartState.PROCESANDO : CartState.IDLE}
                    disabled={terminal.cart.items.length === 0 || terminal.isProcessing}
                    onClick={terminal.actions.initiateCheckout}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
