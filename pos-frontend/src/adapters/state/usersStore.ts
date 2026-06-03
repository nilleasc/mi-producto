import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Cashier {
  id: string;
  cedula: string;
  name: string;
  isActive: boolean;
}

const INITIAL_CASHIERS: Cashier[] = [
  { id: '1', cedula: '1010101010', name: 'Nicolle', isActive: true },
  { id: '2', cedula: '2020202020', name: 'Alejandra', isActive: true },
  { id: '3', cedula: '3030303030', name: 'Carlos', isActive: true },
  { id: '4', cedula: '4040404040', name: 'Valentina', isActive: true }
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
    { name: 'pos-users-v2' }
  )
);
