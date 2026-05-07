import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Cashier {
  id: string;
  cedula: string;
  name: string;
  isActive: boolean;
}

const INITIAL_CASHIERS: Cashier[] = [
  { id: '1', cedula: '1000000001', name: 'Sebastian', isActive: true },
  { id: '2', cedula: '1000000002', name: 'María', isActive: true }
];

interface UsersState {
  cashiers: Cashier[];
  addCashier: (cashier: Cashier) => void;
  toggleStatus: (id: string) => void;
  deleteCashier: (id: string) => void;
}

export const useUsersStore = create<UsersState>()(
  persist(
    (set) => ({
      cashiers: INITIAL_CASHIERS,
      addCashier: (cashier) => set((state) => ({ cashiers: [...state.cashiers, cashier] })),
      toggleStatus: (id) => set((state) => ({
        cashiers: state.cashiers.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c)
      })),
      deleteCashier: (id) => set((state) => ({
        cashiers: state.cashiers.filter(c => c.id !== id)
      })),
    }),
    { name: 'pos-users-v1' }
  )
);
