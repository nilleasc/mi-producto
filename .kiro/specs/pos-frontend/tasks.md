# Plan de Implementación: POS Frontend

## Resumen

Este plan implementa un frontend POS en Next.js 14+ con App Router siguiendo arquitectura hexagonal. El sistema incluye gestión de carrito, búsqueda de productos, proceso de cobro con precio override, manejo de errores y persistencia local. La implementación usa TypeScript strict, React Hook Form + Zod, TanStack Query, y una suite completa de tests con Vitest, Testing Library y fast-check para property-based testing.

## Tareas

- [ ] 1. Configuración inicial del proyecto Next.js
  - Crear proyecto Next.js 14+ con App Router y TypeScript strict
  - Instalar dependencias: Tailwind CSS, React Hook Form, Zod, TanStack Query, Vitest, Testing Library, fast-check
  - Configurar Vitest con soporte para React y TypeScript
  - Crear estructura de carpetas según arquitectura hexagonal (domain, application, adapters/in, adapters/out, infrastructure)
  - _Requerimientos: 6.9_

- [ ] 2. Implementar capa de dominio - Tipos y modelos
  - [ ] 2.1 Crear tipos del carrito (Cart.ts)
    - Definir interfaces TypeScript para CartItem, Cart, CartState
    - Incluir todos los campos: productoId, nombreProducto, precioOficial, cantidad, precioOverride, autorizadoPor, precioAplicado, subtotal, errorCodigo
    - _Requerimientos: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 4.1, 4.2_
  
  - [ ] 2.2 Crear tipos de producto y venta (Product.ts, Sale.ts)
    - Definir interfaces para Product, SaleRequest, SaleRequestItem, SaleResponse, SaleItem
    - _Requerimientos: 2.1, 3.1, 3.4_
  
  - [ ] 2.3 Crear tipos de error (Errors.ts)
    - Definir enum ErrorCode con todos los códigos de error
    - Definir interfaces ApiError y DomainError
    - _Requerimientos: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 3. Implementar capa de dominio - Lógica pura
  - [ ] 3.1 Implementar funciones de cálculo (cartCalculations.ts)
    - Función redondeoHalfUp(valor, decimales) con estrategia HALF_UP
    - Función calcularSubtotal(precioAplicado, cantidad) usando redondeoHalfUp
    - Función calcularTotal(items) sumando subtotales con redondeoHalfUp
    - _Requerimientos: 1.6, 1.7_
  
  - [ ] 3.2 Implementar operaciones del carrito (cartOperations.ts)
    - Función agregarItem con lógica de deduplicación
    - Función quitarItem para eliminar ítems
    - Función actualizarCantidad con manejo de cantidad cero
    - Función deduplicar para consolidar ítems con mismo productoId
    - _Requerimientos: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [ ] 3.3 Implementar validación de precios (priceValidation.ts)
    - Función calcularUmbralDescuento(precioOficial) retornando 70% redondeado
    - Función validarPrecioOverride(precioOverride, precioOficial, autorizadoPor)
    - _Requerimientos: 4.2, 4.3, 4.4, 4.5, 4.8, 4.9_
  
  - [ ] 3.4 Implementar generación de ID de transacción (transactionId.ts)
    - Función generarClientTransactionId() retornando UUID v4
    - _Requerimientos: 3.1, 5.6_

- [ ] 4. Implementar capa de dominio - Puertos (interfaces)
  - [ ] 4.1 Crear interfaz VentaApiPort
    - Método enviarVenta(request: SaleRequest): Promise<SaleResponse>
    - Sin referencias a fetch, axios ni implementaciones concretas
    - _Requerimientos: 6.1, 6.5_
  
  - [ ] 4.2 Crear interfaz ProductoApiPort
    - Método consultarPrecio(productoId: string): Promise<Product>
    - Sin referencias a implementaciones de red
    - _Requerimientos: 6.2, 6.5_
  
  - [ ] 4.3 Crear interfaz CartStoragePort
    - Métodos: guardar(cart), recuperar(), limpiar()
    - Sin referencias a localStorage ni APIs del navegador
    - _Requerimientos: 6.3, 6.5_

- [ ] 5. Checkpoint - Verificar dominio puro
  - Asegurarse de que la capa de dominio no tiene dependencias de React, Next.js, fetch ni localStorage
  - Verificar que todas las funciones de dominio son puras y testeables sin infraestructura
  - Asegurarse de que el código compila sin errores con TypeScript strict: true

- [ ] 6. Implementar adaptadores de salida
  - [ ] 6.1 Implementar VentaHttpAdapter
    - Clase que implementa VentaApiPort usando fetch
    - Método enviarVenta con mapeo completo de códigos HTTP (201, 200, 400, 422, 503, 500, error de red)
    - Transformar respuestas HTTP en ApiError con códigos apropiados
    - _Requerimientos: 3.2, 3.4, 3.5, 5.1, 5.2, 5.3, 5.4, 5.5, 6.4, 6.5_
  
  - [ ] 6.2 Implementar ProductoHttpAdapter
    - Clase que implementa ProductoApiPort usando fetch
    - Método consultarPrecio con mapeo de códigos HTTP (200, 404, 400, 500, error de red)
    - Transformar respuestas HTTP en ApiError
    - _Requerimientos: 2.1, 2.4, 2.5, 2.6, 6.4, 6.5_
  
  - [ ] 6.3 Implementar CartLocalStorageAdapter
    - Clase que implementa CartStoragePort usando localStorage
    - Métodos guardar, recuperar y limpiar con manejo de SSR (typeof window === 'undefined')
    - Manejo seguro de errores de deserialización en recuperar
    - _Requerimientos: 1.10, 6.4, 6.5, 6.8_

- [ ] 7. Implementar infraestructura de inyección de dependencias
  - [ ] 7.1 Crear DependencyContainer
    - Instanciar VentaHttpAdapter, ProductoHttpAdapter, CartLocalStorageAdapter
    - Configurar URL base del backend
    - _Requerimientos: 6.5, 6.10_
  
  - [ ] 7.2 Crear DependencyProvider con React Context
    - Componente que provee contexto con las tres implementaciones de puertos
    - Hook useDependencies() para consumir el contexto
    - _Requerimientos: 6.5, 6.7, 6.10_
  
  - [ ] 7.3 Crear MockDependencyProvider para tests
    - Componente que acepta implementaciones simuladas de los puertos
    - Sin usar librerías de mocking que generen tipos any
    - _Requerimientos: 6.10, 7.9_

- [ ] 8. Implementar casos de uso (Application layer)
  - [ ] 8.1 Implementar hook useCart
    - Restaurar carrito desde CartStoragePort al montar
    - Métodos: agregarItem, quitarItem, actualizarCantidad, actualizarPrecioOverride, vaciarCarrito
    - Persistir automáticamente tras cada operación
    - Usar funciones puras del dominio para cálculos
    - _Requerimientos: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 4.8, 6.6, 6.7_
  
  - [ ] 8.2 Implementar hook useProductSearch
    - Estado: query, resultado, cargando, error, puedeReintentar
    - Método buscar con validación Zod del formato de productoId
    - Método limpiar para resetear estado
    - Consumir ProductoApiPort vía useDependencies
    - _Requerimientos: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 6.7_
  
  - [ ] 8.3 Implementar hook useCheckout
    - Estado: estado, error, ventaResponse, clientTransactionId, bannerServicioDegradado
    - Método iniciarCobro con validaciones pre-envío
    - Método confirmarCobro con generación/reutilización de clientTransactionId
    - Método reintentar preservando clientTransactionId
    - Método resetear para limpiar estado
    - Consumir VentaApiPort vía useDependencies
    - _Requerimientos: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.8, 5.9, 5.10, 6.7_
  
  - [ ] 8.4 Implementar hook usePriceOverride
    - Calcular umbralDescuento, overrideBajoUmbral, precioAplicado, requiereConfirmacion
    - Usar funciones puras del dominio
    - _Requerimientos: 4.2, 4.4, 4.5, 4.8_

- [ ] 9. Checkpoint - Verificar casos de uso
  - Asegurarse de que los hooks no importan directamente adaptadores concretos
  - Verificar que todos los casos de uso consumen puertos vía useDependencies
  - Verificar compilación sin errores TypeScript

- [ ] 10. Implementar componentes UI - Componentes base
  - [ ] 10.1 Crear componente BuscadorProductos
    - Campo de búsqueda con validación de formato
    - Indicador de carga durante consulta
    - Mostrar resultado: nombre, precio oficial, campo cantidad
    - Mostrar mensajes de error específicos por código
    - Botón para agregar al carrito
    - Consumir useProductSearch
    - _Requerimientos: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_
  
  - [ ] 10.2 Crear componente ItemCarrito
    - Mostrar productoId, nombreProducto, precioOficial, cantidad, precioAplicado, subtotal
    - Campo opcional precioOverride con campo autorizadoPor condicional
    - Resaltado visual cuando errorCodigo está presente
    - Advertencia visual cuando precioOverride < umbral 70%
    - Botones para actualizar cantidad y eliminar ítem
    - Consumir usePriceOverride
    - _Requerimientos: 1.3, 1.4, 1.5, 1.6, 4.1, 4.2, 4.4, 5.1, 5.2, 5.3_
  
  - [ ] 10.3 Crear componente CarritoVenta
    - Renderizar lista de ItemCarrito
    - Mostrar total formateado con 2 decimales
    - Mensaje cuando carrito está vacío
    - Callbacks para actualizar cantidad, eliminar ítem, actualizar override
    - _Requerimientos: 1.7, 1.8, 1.11_
  
  - [ ] 10.4 Crear componente BotonCobrar
    - Botón con estados disabled y cargando
    - Indicador de carga y texto "Procesando..." cuando cargando
    - Atributos aria-busy y aria-label para accesibilidad
    - _Requerimientos: 1.11, 3.2, 3.7_

- [ ] 11. Implementar componentes UI - Componentes de feedback
  - [ ] 11.1 Crear componente DialogoConfirmacionDescuento
    - Modal que lista ítems con override bajo umbral
    - Mostrar productoId, precioOficial, precioOverride, porcentaje de descuento
    - Botones Confirmar y Cancelar
    - Soporte para tecla Escape
    - Trampa de foco (focus trap) para accesibilidad
    - _Requerimientos: 4.4, 4.5, 4.6, 4.7_
  
  - [ ] 11.2 Crear componente BannerServicioDegradado
    - Banner fijo en parte superior con role="alert"
    - Mostrar mensaje de servicio degradado
    - Ocultarse automáticamente cuando visible=false
    - _Requerimientos: 5.4, 5.9_
  
  - [ ] 11.3 Crear componente Recibo
    - Mostrar ventaId, timestamp, lista de ítems, totalVenta
    - Botón "Nueva Venta" que invoca callback onNuevaVenta
    - _Requerimientos: 3.4, 3.6_

- [ ] 12. Implementar componente raíz TerminalDeVenta
  - Componer BuscadorProductos, CarritoVenta, BotonCobrar, DialogoConfirmacionDescuento, BannerServicioDegradado, Recibo
  - Gestionar estado global: EstadoCobro (IDLE, PROCESANDO, COMPLETADA, ERROR)
  - Coordinar transición entre vista carrito y vista recibo
  - Mostrar/ocultar diálogos y banners según estado
  - Envolver con DependencyProvider
  - Consumir useCart, useCheckout
  - _Requerimientos: 1.8, 1.9, 3.2, 3.6, 4.5, 4.6, 4.7, 5.4, 5.8, 5.9, 6.5_

- [ ] 13. Crear página principal Next.js App Router
  - Crear app/page.tsx que renderiza TerminalDeVenta
  - Configurar layout con DependencyProvider
  - Manejar SSR fallback (servir página con estado vacío si backend no responde)
  - _Requerimientos: 6.8_

- [ ] 14. Checkpoint - Verificar integración UI
  - Asegurarse de que todos los componentes compilan sin errores
  - Verificar que no hay importaciones directas de adaptadores en componentes
  - Verificar que el flujo completo de venta funciona end-to-end manualmente

- [ ] 15. Implementar tests unitarios del dominio
  - [ ]* 15.1 Tests para cartCalculations.ts
    - Test redondeoHalfUp con casos: 0.5 → 1, 1.5 → 2, 2.25 → 2.25
    - Test calcularSubtotal con precios y cantidades variadas
    - Test calcularTotal con múltiples ítems
    - _Requerimientos: 1.6, 1.7_
  
  - [ ]* 15.2 Tests para cartOperations.ts
    - Test agregarItem con producto nuevo
    - Test agregarItem con producto existente (deduplicación)
    - Test quitarItem
    - Test actualizarCantidad con cantidad > 0 y cantidad = 0
    - _Requerimientos: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [ ]* 15.3 Tests para priceValidation.ts
    - Test calcularUmbralDescuento con varios precios oficiales
    - Test validarPrecioOverride con override válido, inválido, bajo umbral
    - _Requerimientos: 4.2, 4.3, 4.4, 4.9_
  
  - [ ]* 15.4 Tests para transactionId.ts
    - Test generarClientTransactionId retorna UUID v4 válido
    - Test generarClientTransactionId retorna valores únicos en llamadas sucesivas
    - _Requerimientos: 3.1_

- [ ] 16. Implementar property-based tests con fast-check
  - [ ]* 16.1 Propiedad 1: Consistencia del total con suma de subtotales
    - **Propiedad 1: Consistencia del total con suma de subtotales**
    - **Valida: Requerimientos 1.7, 7.1**
    - Generar carritos arbitrarios con fc.array de ítems
    - Verificar que calcularTotal(items) === sum(subtotales) redondeado HALF_UP
  
  - [ ]* 16.2 Propiedad 2: Idempotencia del cálculo del total
    - **Propiedad 2: Idempotencia del cálculo del total**
    - **Valida: Requerimientos 7.2**
    - Generar carrito arbitrario
    - Verificar que calcularTotal(cart) === calcularTotal(cart)
  
  - [ ]* 16.3 Propiedad 3: Subtotal con precisión de 2 decimales
    - **Propiedad 3: Subtotal con precisión de 2 decimales**
    - **Valida: Requerimientos 1.6, 7.4**
    - Generar precio y cantidad arbitrarios con fc.float y fc.integer
    - Verificar que calcularSubtotal tiene máximo 2 decimales y es >= 0
  
  - [ ]* 16.4 Propiedad 4: Umbral de descuento es exactamente 70% redondeado
    - **Propiedad 4: Umbral de descuento es exactamente 70% redondeado HALF_UP**
    - **Valida: Requerimientos 7.3**
    - Generar precio oficial arbitrario con fc.float
    - Verificar que calcularUmbralDescuento === redondeoHalfUp(precio × 0.70, 2)
  
  - [ ]* 16.5 Propiedad 5: Invariante de deduplicación del carrito
    - **Propiedad 5: Invariante de deduplicación del carrito**
    - **Valida: Requerimientos 1.2, 7.5**
    - Generar productoId y dos cantidades arbitrarias con fc.string y fc.integer
    - Agregar mismo producto dos veces
    - Verificar que existe exactamente un CartItem con cantidad = c1 + c2
  
  - [ ]* 16.6 Propiedad 6: Total del carrito es siempre no negativo
    - **Propiedad 6: Total del carrito es siempre no negativo**
    - **Valida: Requerimientos 7.6**
    - Generar carrito con precios y cantidades positivos
    - Verificar que calcularTotal(cart) >= 0
  
  - [ ]* 16.7 Propiedad 7: precioAplicado refleja correctamente el override
    - **Propiedad 7: precioAplicado refleja correctamente el override**
    - **Valida: Requerimientos 4.8**
    - Generar CartItem con y sin precioOverride
    - Verificar que precioAplicado === precioOverride ?? precioOficial
  
  - [ ]* 16.8 Propiedad 8: Idempotencia del clientTransactionId en reintentos
    - **Propiedad 8: Idempotencia del clientTransactionId en reintentos**
    - **Valida: Requerimientos 3.3, 5.6, 5.10**
    - Simular transacción fallida y múltiples reintentos
    - Verificar que clientTransactionId es idéntico en todos los reintentos
  
  - [ ]* 16.9 Propiedad 9: Round-trip de serialización del carrito
    - **Propiedad 9: Round-trip de serialización del carrito**
    - **Valida: Requerimientos 1.10**
    - Generar carrito arbitrario
    - Serializar con JSON.stringify y deserializar con JSON.parse
    - Verificar que el carrito recuperado es estructuralmente equivalente al original

- [ ] 17. Implementar tests de componentes con Testing Library
  - [ ]* 17.1 Tests para BuscadorProductos
    - Test búsqueda exitosa muestra producto y precio
    - Test error 404 muestra mensaje "Producto no encontrado"
    - Test error 400 muestra mensaje "Formato de ID inválido"
    - Test indicador de carga durante consulta
    - Test agregar producto al carrito invoca callback
    - _Requerimientos: 2.1, 2.2, 2.3, 2.4, 2.5, 2.7_
  
  - [ ]* 17.2 Tests para ItemCarrito
    - Test muestra todos los campos del ítem correctamente
    - Test campo autorizadoPor aparece cuando se ingresa precioOverride
    - Test advertencia visual cuando override < umbral 70%
    - Test resaltado visual cuando errorCodigo está presente
    - _Requerimientos: 4.1, 4.2, 4.4, 5.1, 5.2, 5.3_
  
  - [ ]* 17.3 Tests para CarritoVenta
    - Test renderiza lista de ítems correctamente
    - Test muestra total con 2 decimales
    - Test muestra mensaje cuando carrito está vacío
    - _Requerimientos: 1.7, 1.8, 1.11_
  
  - [ ]* 17.4 Tests para BotonCobrar
    - Test botón deshabilitado cuando disabled=true
    - Test muestra indicador de carga cuando cargando=true
    - Test atributos aria-busy y aria-label presentes
    - _Requerimientos: 1.11, 3.2, 3.7_
  
  - [ ]* 17.5 Tests para DialogoConfirmacionDescuento
    - Test muestra lista de ítems afectados con porcentajes
    - Test botón Confirmar invoca callback onConfirmar
    - Test botón Cancelar invoca callback onCancelar
    - Test tecla Escape invoca onCancelar
    - _Requerimientos: 4.4, 4.5, 4.6, 4.7_
  
  - [ ]* 17.6 Tests para BannerServicioDegradado
    - Test se muestra cuando visible=true con role="alert"
    - Test se oculta cuando visible=false
    - _Requerimientos: 5.4, 5.9_
  
  - [ ]* 17.7 Tests para Recibo
    - Test muestra ventaId, timestamp, ítems y totalVenta
    - Test botón "Nueva Venta" invoca callback onNuevaVenta
    - _Requerimientos: 3.4, 3.6_

- [ ] 18. Implementar tests de manejo de errores
  - [ ]* 18.1 Test error STOCK_INSUFICIENTE
    - Simular respuesta 422 con código STOCK_INSUFICIENTE
    - Verificar que ítem afectado se resalta y muestra mensaje correcto
    - Verificar que carrito se mantiene intacto
    - _Requerimientos: 5.1, 7.7_
  
  - [ ]* 18.2 Test error PRODUCTO_NO_ENCONTRADO
    - Simular respuesta 422 con código PRODUCTO_NO_ENCONTRADO
    - Verificar mensaje "Producto [productoId] no encontrado en el sistema"
    - Verificar que carrito se mantiene intacto
    - _Requerimientos: 5.2, 7.7_
  
  - [ ]* 18.3 Test error PRECIO_FUERA_DE_RANGO
    - Simular respuesta 422 con código PRECIO_FUERA_DE_RANGO
    - Verificar advertencia en ítem afectado
    - Verificar que carrito se mantiene intacto
    - _Requerimientos: 5.3, 7.7_
  
  - [ ]* 18.4 Test error SERVICIO_STOCK_NO_DISPONIBLE
    - Simular respuesta 503 con código SERVICIO_STOCK_NO_DISPONIBLE
    - Verificar que BannerServicioDegradado se muestra
    - Verificar que carrito se mantiene intacto
    - _Requerimientos: 5.4, 7.7_
  
  - [ ]* 18.5 Test error ERROR_PERSISTENCIA con reintento
    - Simular respuesta 500 con código ERROR_PERSISTENCIA
    - Verificar mensaje con botón "Reintentar"
    - Verificar que reintento usa mismo clientTransactionId
    - _Requerimientos: 5.5, 5.6, 7.7_

- [ ] 19. Implementar tests de integración end-to-end
  - [ ]* 19.1 Test flujo completo de venta exitosa
    - Buscar producto, agregar al carrito, cobrar, ver recibo
    - Verificar que todos los componentes interactúan correctamente
    - Usar MockDependencyProvider con adaptadores simulados
    - _Requerimientos: 1.1, 2.1, 3.1, 3.4, 3.6_
  
  - [ ]* 19.2 Test flujo con precio override y confirmación
    - Agregar producto, ingresar override < 70%, confirmar diálogo, cobrar
    - Verificar que diálogo se muestra y cobro procede tras confirmación
    - _Requerimientos: 4.1, 4.2, 4.4, 4.5, 4.6_
  
  - [ ]* 19.3 Test persistencia del carrito tras recarga
    - Agregar ítems al carrito, simular recarga (remount componente)
    - Verificar que carrito se restaura desde CartStoragePort
    - _Requerimientos: 1.10_
  
  - [ ]* 19.4 Test idempotencia de cobro con reintento
    - Iniciar cobro, simular error 500, reintentar
    - Verificar que ambos intentos usan mismo clientTransactionId
    - Simular respuesta 200 idempotente en reintento
    - _Requerimientos: 3.3, 3.5, 5.6, 5.10_

- [ ] 20. Checkpoint final - Ejecutar suite completa de tests
  - Ejecutar `vitest --run` para todos los tests
  - Verificar que todos los tests pasan sin errores
  - Verificar que no hay warnings de TypeScript
  - Verificar cobertura de tests para lógica crítica del dominio

## Notas

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia los requerimientos específicos que implementa para trazabilidad
- Los checkpoints aseguran validación incremental del progreso
- Los property-based tests validan propiedades universales de corrección
- Los tests unitarios validan ejemplos específicos y casos borde
- Los tests de integración validan flujos end-to-end completos
- La arquitectura hexagonal permite testear el dominio de forma aislada sin infraestructura
