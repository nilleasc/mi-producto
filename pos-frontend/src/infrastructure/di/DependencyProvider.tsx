    'use client';

    import React, { createContext, useContext, ReactNode } from 'react';
    import { Dependencies, createDependencyContainer } from './DependencyContainer';

    /**
     * Contexto de React para inyección de dependencias
     * 
     * Provee las implementaciones de los puertos a toda la aplicación.
     */
    const DependencyContext = createContext<Dependencies | null>(null);

    /**
     * Props del DependencyProvider
     */
    interface DependencyProviderProps {
    /** URL base del backend */
    baseUrl: string;
    /** Componentes hijos */
    children: ReactNode;
    }

    /**
     * Proveedor de dependencias
     * 
     * Envuelve la aplicación y provee las implementaciones concretas de los puertos
     * a través de React Context.
     * 
     * @example
     * ```tsx
     * <DependencyProvider baseUrl="http://localhost:8080">
     *   <App />
     * </DependencyProvider>
     * ```
     */
    export function DependencyProvider({ baseUrl, children }: DependencyProviderProps) {
    const dependencies = createDependencyContainer(baseUrl);

    return (
        <DependencyContext.Provider value={dependencies}>
        {children}
        </DependencyContext.Provider>
    );
    }

    /**
     * Hook para consumir las dependencias
     * 
     * Permite a los casos de uso y componentes acceder a las implementaciones
     * de los puertos sin importar directamente los adaptadores concretos.
     * 
     * @returns Objeto con ventaApi, productoApi y cartStorage
     * @throws Error si se usa fuera de un DependencyProvider
     * 
     * @example
     * ```tsx
     * function MyComponent() {
     *   const { ventaApi, productoApi, cartStorage } = useDependencies();
     *   // Usar los puertos...
     * }
     * ```
     */
    export function useDependencies(): Dependencies {
    const context = useContext(DependencyContext);

    if (!context) {
        throw new Error('useDependencies debe usarse dentro de un DependencyProvider');
    }

    return context;
    }
