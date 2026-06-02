    import { CartStoragePort } from '../../domain/ports/CartStoragePort';
    import { Cart } from '../../domain/cart/Cart';

    /**
     * Adaptador de almacenamiento local para el carrito
     * 
     * Implementa CartStoragePort usando localStorage del navegador.
     * Maneja correctamente el entorno SSR de Next.js.
     */
    export class CartLocalStorageAdapter implements CartStoragePort {
    private readonly storageKey = 'pos_cart';

    /**
     * Guarda el carrito en localStorage
     * 
     * En entorno SSR (typeof window === 'undefined'), no hace nada.
     */
    guardar(cart: Cart): void {
        // Verificar si estamos en el navegador
        if (typeof window === 'undefined') {
        return; // No-op en SSR
        }

        try {
        const serialized = JSON.stringify(cart);
        localStorage.setItem(this.storageKey, serialized);
        } catch (error) {
        // Silenciar errores de localStorage (ej. cuota excedida)
        console.error('Error al guardar carrito en localStorage:', error);
        }
    }

    /**
     * Recupera el carrito desde localStorage
     * 
     * En entorno SSR, devuelve null.
     * Si la deserialización falla, devuelve null sin lanzar error.
     */
    recuperar(): Cart | null {
        // Verificar si estamos en el navegador
        if (typeof window === 'undefined') {
        return null; // Devolver null en SSR
        }

        try {
        const serialized = localStorage.getItem(this.storageKey);
        
        if (!serialized) {
            return null;
        }

        const cart = JSON.parse(serialized) as Cart;
        
        // Validar que el objeto tiene la estructura esperada
        if (!cart.items || !Array.isArray(cart.items)) {
            return null;
        }

        return cart;
        } catch (error) {
        // Si la deserialización falla, devolver null
        console.error('Error al recuperar carrito desde localStorage:', error);
        return null;
        }
    }

    /**
     * Elimina el carrito de localStorage
     * 
     * En entorno SSR, no hace nada.
     */
    limpiar(): void {
        // Verificar si estamos en el navegador
        if (typeof window === 'undefined') {
        return; // No-op en SSR
        }

        try {
        localStorage.removeItem(this.storageKey);
        } catch (error) {
        // Silenciar errores de localStorage
        console.error('Error al limpiar carrito en localStorage:', error);
        }
    }
    }
