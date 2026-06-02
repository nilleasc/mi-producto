'use client';

import { createContext, useContext, ReactNode } from 'react';
import { Dependencies } from './DependencyContainer';

/**
 * Contexto de React para inyección de dependencias simuladas
 * 
 * Usado exclusivamente en tests para proveer implementaciones simuladas
 * de los puertos sin usar librerías de mocking que generen tipos any.
 */
const MockDependencyContext = createContext<Dependencies | null>(null);

/**
 * Props del MockDependencyProvider
 */
interface MockDependencyProviderProps {
  /** Implementación simulada de VentaApiPort */
  ventaApi: Dependencies['ventaApi'];
  /** Implementación simulada de ProductoApiPort */
  productoApi: Dependencies['productoApi'];
  /** Implementación simulada de CartStoragePort */
  cartStorage: Dependencies['cartStorage'];
  /** Implementación simulada de SalesHistoryPort */
  salesHistoryPort: Dependencies['salesHistoryPort'];
  /** Implementación simulada de FrozenSalesPort */
  frozenSalesPort: Dependencies['frozenSalesPort'];
  /** Componentes hijos */
  children: ReactNode;
}

/**
 * Proveedor de dependencias simuladas para tests
 * 
 * Permite inyectar implementaciones simuladas de los puertos en tests
 * sin usar librerías de mocking que generen tipos any.
 * 
 * Las implementaciones simuladas deben ser objetos que implementen
 * las interfaces de los puertos.
 */
export function MockDependencyProvider({
  ventaApi,
  productoApi,
  cartStorage,
  salesHistoryPort,
  frozenSalesPort,
  children,
}: MockDependencyProviderProps) {
  const dependencies: Dependencies = {
    ventaApi,
    productoApi,
    cartStorage,
    salesHistoryPort,
    frozenSalesPort,
  };

  return (
    <MockDependencyContext.Provider value={dependencies}>
      {children}
    </MockDependencyContext.Provider>
  );
}

/**
 * Hook para consumir las dependencias simuladas en tests
 * 
 * Funciona igual que useDependencies pero consume el contexto de mocks.
 * 
 * @returns Objeto con todas las dependencias simuladas
 * @throws Error si se usa fuera de un MockDependencyProvider
 */
export function useMockDependencies(): Dependencies {
  const context = useContext(MockDependencyContext);

  if (!context) {
    throw new Error('useMockDependencies debe usarse dentro de un MockDependencyProvider');
  }

  return context;
}
