import { FrozenSalesPort, FrozenSale } from '../../domain/ports/FrozenSalesPort';
import { Cart } from '../../domain/cart/Cart';

const STORAGE_KEY = 'pos-frozen-sales';

export class FrozenSalesLocalStorage implements FrozenSalesPort {

  async congelarVenta(cart: Cart, nota?: string): Promise<FrozenSale> {
    const frozenSale: FrozenSale = {
      frozenId: `FROZEN-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      cart,
      frozenAt: Date.now(),
      nota,
      sessionId: this.getSessionId(),
    };
    const sales = this.readFromStorage();
    sales.push(frozenSale);
    this.writeToStorage(sales);
    return frozenSale;
  }

  async listarVentasCongeladas(): Promise<FrozenSale[]> {
    return this.readFromStorage();
  }

  async recuperarVenta(frozenId: string): Promise<FrozenSale> {
    const sales = this.readFromStorage();
    const sale = sales.find(s => s.frozenId === frozenId);
    if (!sale) throw new Error(`Venta congelada no encontrada: ${frozenId}`);
    return sale;
  }

  async eliminarVentaCongelada(frozenId: string): Promise<void> {
    const sales = this.readFromStorage().filter(s => s.frozenId !== frozenId);
    this.writeToStorage(sales);
  }

  async limpiarVentasAntiguas(maxAgeMs: number): Promise<number> {
    const now = Date.now();
    const sales = this.readFromStorage();
    const filtered = sales.filter(s => (now - s.frozenAt) < maxAgeMs);
    this.writeToStorage(filtered);
    return sales.length - filtered.length;
  }

  private readFromStorage(): FrozenSale[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? (JSON.parse(data) as FrozenSale[]) : [];
    } catch {
      return [];
    }
  }

  private writeToStorage(sales: FrozenSale[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sales));
    } catch (error) {
      console.error('Error saving frozen sales:', error);
    }
  }

  private getSessionId(): string {
    if (typeof window === 'undefined') return 'server-session';
    let id = sessionStorage.getItem('pos-session-id');
    if (!id) {
      id = `SESSION-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      sessionStorage.setItem('pos-session-id', id);
    }
    return id;
  }
}