import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '../domain/entities/Cart';

export interface SaleRecord {
  id: string;
  date: string;
  buyerId: string;
  sellerId: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  cashReceived: number;
}

interface SalesState {
  sales: SaleRecord[];
  addSale: (sale: SaleRecord) => void;
  clearSales: () => void;
}

export const useSalesStore = create<SalesState>()(
  persist(
    (set) => ({
      sales: [],
      addSale: (sale) => set((state) => ({ sales: [sale, ...state.sales] })),
      clearSales: () => set({ sales: [] }),
    }),
    { name: 'pos-sales-v1' }
  )
);
