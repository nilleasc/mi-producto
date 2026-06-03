import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../core/entities/Product';

const INITIAL_PRODUCTS: Product[] = [
  { id: '1', sku: 'PAN001' as any, name: 'Pan de Masa Madre', price: { amount: 12000, currency: 'COP' } as any, stock: 15, categoryId: 'c1', variants: [], isActive: true, imageUrl: null, unitOfMeasure: 'UND' },
  { id: '2', sku: 'TEA001' as any, name: 'Té Chai Artesanal', price: { amount: 9500, currency: 'COP' } as any, stock: 40, categoryId: 'c2', variants: [], isActive: true, imageUrl: null, unitOfMeasure: 'UND' },
  { id: '3', sku: 'TAR001' as any, name: 'Tarta de Zanahoria', price: { amount: 8000, currency: 'COP' } as any, stock: 8, categoryId: 'c1', variants: [], isActive: true, imageUrl: null, unitOfMeasure: 'UND' },
  { id: '4', sku: 'GAL001' as any, name: 'Galleta de Avena y Miel', price: { amount: 4500, currency: 'COP' } as any, stock: 25, categoryId: 'c1', variants: [], isActive: true, imageUrl: null, unitOfMeasure: 'UND' },
  { id: '5', sku: 'KOM001' as any, name: 'Kombucha Frutos Rojos', price: { amount: 11000, currency: 'COP' } as any, stock: 12, categoryId: 'c2', variants: [], isActive: true, imageUrl: null, unitOfMeasure: 'UND' },
  { id: '6', sku: 'SAN001' as any, name: 'Sándwich Caprese', price: { amount: 15000, currency: 'COP' } as any, stock: 10, categoryId: 'c3', variants: [], isActive: true, imageUrl: null, unitOfMeasure: 'UND' },
  { id: '7', sku: 'ACA001' as any, name: 'Tazón de Acai', price: { amount: 18000, currency: 'COP' } as any, stock: 5, categoryId: 'c3', variants: [], isActive: true, imageUrl: null, unitOfMeasure: 'UND' },
  { id: '8', sku: 'MUF001' as any, name: 'Muffin de Arándanos', price: { amount: 6000, currency: 'COP' } as any, stock: 18, categoryId: 'c1', variants: [], isActive: true, imageUrl: null, unitOfMeasure: 'UND' },
  { id: '9', sku: 'KAF001' as any, name: 'Café Moka Especial', price: { amount: 10500, currency: 'COP' } as any, stock: 50, categoryId: 'c2', variants: [], isActive: true, imageUrl: null, unitOfMeasure: 'UND' }
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
    { name: 'pos-inventory-v4' }
  )
);
