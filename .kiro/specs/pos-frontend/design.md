# POS Frontend Design

## Architecture
- **Framework:** React con Vite. **Justificación:** Se eligió React debido a su arquitectura basada en componentes funcionales y Hooks, lo cual permite un ciclo de vida predecible y actualizaciones rápidas del DOM (Virtual DOM) ideales para la alta interactividad que requiere una terminal de punto de venta (POS). Además, el uso de Vite como empaquetador garantiza tiempos de compilación y recarga en caliente instantáneos en desarrollo.
- **State Management:** Zustand. **Justificación:** A diferencia de Context API o Redux, Zustand permite una gestión de estado global extremadamente ligera y sin re-renderizados innecesarios, lo cual es crítico para mantener la fluidez al actualizar el carrito de compras a cada instante.
- **Language:** Strict TypeScript.
- **Architecture Pattern:** Arquitectura Hexagonal (Ports and Adapters).
- **Styling:** Tailwind CSS.

## Directory Structure
- `core/`: Business entities, policies, and use-cases.
- `adapters/`: Implementations of ports, HTTP clients, and global Zustand state.
- `features/`: UI components and views.

## Data Models (TypeScript Interfaces)
- `Product`: id, sku (barcode), name, price, stock, category.
- `CartItem`: product, quantity, lineTotal.
- `Sale`: id, items, subtotal, tax, total, paymentMethod.

## Offline Strategy
- LocalStorage / IndexedDB via Adapters for syncing the product catalog on initial load.
