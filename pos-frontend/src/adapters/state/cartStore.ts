import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Cart, CartItem } from '../core/entities/Cart';
import { Product } from '../core/entities/Product';

interface CartState {
  carts: Record<string, Cart>;
  activeCartId: string | null;
  actions: {
    setActiveCart: (id: string) => void;
    addItem: (product: Product, quantity: number) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
  };
}

const createEmptyCart = (id: string): Cart => ({
  id,
  items: [],
  customerId: null,
  discounts: [],
  couponCode: null,
  status: 'active'
});

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      carts: { 'default': createEmptyCart('default') },
      activeCartId: 'default',
      actions: {
        setActiveCart: (id) => set({ activeCartId: id }),
        addItem: (product, quantity) => set((state) => {
          if (!state.activeCartId) return state;
          const cart = state.carts[state.activeCartId] || createEmptyCart(state.activeCartId);
          const existingItemIndex = cart.items ? cart.items.findIndex(item => item.productId === product.id) : -1;

          let newItems = cart.items ? [...cart.items] : [];
          if (existingItemIndex >= 0) {
            const existing = newItems[existingItemIndex];
            if (existing) {
              newItems[existingItemIndex] = {
                ...existing,
                quantity: existing.quantity + quantity
              };
            }
          } else {
            newItems.push({
              id: Math.random().toString(36).substr(2, 9),
              productId: product.id,
              productName: product.name,
              unitPrice: product.price,
              quantity,
              discounts: []
            });
          }

          return {
            carts: {
              ...state.carts,
              [state.activeCartId]: { ...cart, items: newItems }
            }
          };
        }),
        removeItem: (productId) => set((state) => {
          if (!state.activeCartId) return state;
          const cart = state.carts[state.activeCartId];
          if (!cart || !cart.items) return state;
          return {
            carts: {
              ...state.carts,
              [state.activeCartId]: {
                ...cart,
                items: cart.items.filter(item => item.productId !== productId)
              }
            }
          };
        }),
        updateQuantity: (productId, quantity) => set((state) => {
          if (!state.activeCartId) return state;
          const cart = state.carts[state.activeCartId];
          if (!cart || !cart.items) return state;
          if (quantity <= 0) {
            return {
              carts: {
                ...state.carts,
                [state.activeCartId]: {
                  ...cart,
                  items: cart.items.filter(item => item.productId !== productId)
                }
              }
            };
          }
          return {
            carts: {
              ...state.carts,
              [state.activeCartId]: {
                ...cart,
                items: cart.items.map(item =>
                  item.productId === productId ? { ...item, quantity } : item
                )
              }
            }
          };
        }),
        clearCart: () => set((state) => {
          if (!state.activeCartId) return state;
          return {
            carts: {
              ...state.carts,
              [state.activeCartId]: createEmptyCart(state.activeCartId)
            }
          };
        }),
      },
    }),
    {
      name: 'pos-cart-v4',
      partialize: (state) => Object.fromEntries(
        Object.entries(state).filter(([key]) => key !== 'actions')
      ),
    }
  )
);
