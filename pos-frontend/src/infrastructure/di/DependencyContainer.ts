import { VentaApiPort } from '../../domain/ports/VentaApiPort';
import { ProductoApiPort } from '../../domain/ports/ProductoApiPort';
import { CartStoragePort } from '../../domain/ports/CartStoragePort';
import { SalesHistoryPort } from '../../domain/ports/SalesHistoryPort';
import { FrozenSalesPort } from '../../domain/ports/FrozenSalesPort';
import { VentaHttpAdapter } from '../../adapters/out/VentaHttpAdapter';
import { ProductoHttpAdapter } from '../../adapters/out/ProductoHttpAdapter';
import { CartLocalStorageAdapter } from '../../adapters/out/CartLocalStorageAdapter';
import { FrozenSalesLocalStorage } from '../storage/FrozenSalesLocalStorage';
import { SalesHistoryLocalStorage } from '../storage/SalesHistoryLocalStorage';

/**
 * Contenedor de dependencias
 * 
 * Crea y configura las instancias concretas de los adaptadores.
 * Este es el único lugar donde se instancian las implementaciones concretas.
 */
export interface Dependencies {
  ventaApi: VentaApiPort;
  productoApi: ProductoApiPort;
  cartStorage: CartStoragePort;
  salesHistoryPort: SalesHistoryPort;
  frozenSalesPort: FrozenSalesPort;
}

/**
 * Crea el contenedor de dependencias con las implementaciones reales
 * 
 * @param baseUrl - URL base del backend (ej. http://localhost:8080)
 * @returns Objeto con todas las implementaciones de puertos
 */
export function createDependencyContainer(baseUrl: string): Dependencies {
  return {
    ventaApi: new VentaHttpAdapter(baseUrl),
    productoApi: new ProductoHttpAdapter(baseUrl),
    cartStorage: new CartLocalStorageAdapter(),
    salesHistoryPort: new SalesHistoryLocalStorage(),
    frozenSalesPort: new FrozenSalesLocalStorage(),
  };
}
