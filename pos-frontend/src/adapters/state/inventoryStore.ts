import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../core/entities/Product';

const INITIAL_PRODUCTS: Product[] = [
  { id: '1', sku: 'SKU001' as any, name: 'Café Espresso', price: { amount: 4500, currency: 'COP' } as any, stock: 50, categoryId: 'c1', variants: [], isActive: true, imageUrl: null, unitOfMeasure: 'UND' },
  { id: '2', sku: 'SKU002' as any, name: 'Café Latte Grande', price: { amount: 8900, currency: 'COP' } as any, stock: 12, categoryId: 'c1', variants: [], isActive: true, imageUrl: null, unitOfMeasure: 'UND' },
  { id: '3', sku: 'SKU003' as any, name: 'Croissant de Mantequilla', price: { amount: 5500, currency: 'COP' } as any, stock: 8, categoryId: 'c2', variants: [], isActive: true, imageUrl: null, unitOfMeasure: 'UND' },
  { id: '4', sku: '123456789' as any, name: 'Agua Manantial 500ml', price: { amount: 3200, currency: 'COP' } as any, stock: 100, categoryId: 'c3', variants: [], isActive: true, imageUrl: null, unitOfMeasure: 'UND' },
  { id: '5', sku: 'SKU005' as any, name: 'Empanada de Carne', price: { amount: 2800, currency: 'COP' } as any, stock: 20, categoryId: 'c2', variants: [], isActive: true, imageUrl: null, unitOfMeasure: 'UND' },
  { id: '6', sku: 'SKU006' as any, name: 'Jugo de Naranja Natural', price: { amount: 7500, currency: 'COP' } as any, stock: 15, categoryId: 'c3', variants: [], isActive: true, imageUrl: null, unitOfMeasure: 'UND' }
];

interface InventoryState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  fetchProducts: () => Promise<void>;
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set) => ({
      products: INITIAL_PRODUCTS,
      isLoading: false,
      error: null,
      fetchProducts: async () => {
        set({ isLoading: true, error: null });
        try {
          const { apiClient } = await import('../../infrastructure/http/apiClient');
          const data = await apiClient.get('/api/products');
          // Mapear los datos de Spring Boot al modelo del frontend
          const mappedProducts = data.map((item: any) => ({
            id: item.id,
            sku: item.sku || item.barcode || 'N/A',
            name: item.name,
            price: { amount: Number(item.price), currency: 'COP' },
            stock: Number(item.stock),
            categoryId: item.categoryId || 'c1',
            variants: [],
            isActive: item.active !== false,
            imageUrl: null,
            unitOfMeasure: 'UND'
          }));
          set({ products: mappedProducts, isLoading: false });
        } catch (error: any) {
          console.error("Error fetching products:", error);
          set({ error: error.message, isLoading: false });
        }
      },
      addProduct: (product) => set((state) => ({ products: [...state.products, product] })),
      updateProduct: (updatedProduct) => set((state) => ({
        products: state.products.map(p => p.id === updatedProduct.id ? updatedProduct : p)
      })),
      deleteProduct: (id) => set((state) => ({
        products: state.products.filter(p => p.id !== id)
      })),
    }),
    { name: 'pos-inventory-v3' }
  )
);
