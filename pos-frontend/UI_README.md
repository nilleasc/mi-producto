# Terminal POS - Interfaz de Usuario

## 📁 Estructura de la UI

```
src/adapters/in/
├── components/          # Componentes reutilizables
│   ├── CartItem.tsx     # Item individual del carrito
│   ├── CartPanel.tsx    # Panel completo del carrito
│   ├── CheckoutButton.tsx  # Botón de pago con estados
│   ├── ErrorBanner.tsx  # Banner de errores
│   ├── ProductSearch.tsx   # Búsqueda de productos
│   └── SaleReceipt.tsx  # Recibo de venta exitosa
└── pages/
    └── PosPage.tsx      # Página principal del POS
```

## 🎯 Arquitectura Hexagonal - Capa de Presentación

### ✅ Principios Cumplidos

1. **Sin lógica de negocio**: Todos los cálculos vienen de hooks
2. **Sin acceso directo a puertos**: Solo usa hooks de `application/`
3. **Sin infraestructura**: No hay fetch, localStorage ni APIs del navegador
4. **Componentes funcionales**: React puro con TypeScript strict
5. **Next.js App Router**: Compatible con `'use client'`

### 🔌 Hooks Consumidos

- `useCart()` - Gestión del carrito
- `useProductSearch()` - Búsqueda de productos
- `useCheckout()` - Proceso de cobro
- `usePriceOverride()` - Validación de precios (no usado aún)

## 🚀 Funcionalidades Implementadas

### 1. Búsqueda de Productos (ProductSearch)
- Campo de entrada para ID de producto
- Validación de formato
- Indicador de carga
- Manejo de errores (404, 400, 500)
- Botón de reintento para errores recuperables
- Agregar producto al carrito con cantidad

### 2. Carrito de Compras (CartPanel + CartItem)
- Lista de productos agregados
- Modificar cantidad (+/-)
- Eliminar items
- Mostrar subtotal por item
- Mostrar total general
- Mensaje cuando está vacío
- Resumen de items y unidades

### 3. Proceso de Pago (CheckoutButton)
- Botón con estados (normal, procesando, deshabilitado)
- Indicador de carga animado
- Atributos ARIA para accesibilidad
- Validación de carrito vacío

### 4. Recibo de Venta (SaleReceipt)
- Mostrar ID de venta
- Fecha y hora de la transacción
- Lista de productos vendidos
- Total de la venta
- Botón "Nueva Venta" para resetear

### 5. Manejo de Errores (ErrorBanner)
- Banner visual para errores
- Mostrar código y mensaje
- Campo afectado (si aplica)
- Botón de cerrar
- Role="alert" para accesibilidad

### 6. Servicio Degradado
- Banner amarillo cuando servicio de stock no disponible
- Mensaje informativo
- No bloquea la venta

## 🎨 Diseño UI

### Layout Principal (3 columnas en desktop)
- **Columna izquierda**: Búsqueda de productos
- **Columna derecha (2 cols)**: Carrito + Checkout

### Estados de la Aplicación
1. **IDLE**: Vista normal (búsqueda + carrito)
2. **PROCESANDO**: Botón de checkout con spinner
3. **COMPLETADA**: Vista de recibo
4. **ERROR**: Banner de error + opción de reintento

### Colores y Estilos
- **Primario**: Azul (#2563eb) - Botones principales
- **Éxito**: Verde (#16a34a) - Checkout y recibo
- **Error**: Rojo (#dc2626) - Errores y eliminación
- **Advertencia**: Amarillo (#eab308) - Servicio degradado
- **Neutral**: Gris - Fondos y textos secundarios

## 🔧 Configuración

### Variables de Entorno

Crear archivo `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Ejecutar en Desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## 📝 Flujo de Usuario

1. **Buscar producto**: Ingresar ID y presionar "Buscar"
2. **Ver resultado**: Producto encontrado con precio
3. **Agregar al carrito**: Seleccionar cantidad y agregar
4. **Modificar carrito**: Ajustar cantidades o eliminar items
5. **Procesar pago**: Click en "Procesar Pago"
6. **Confirmación**: Si hay descuentos >30%, confirmar
7. **Ver recibo**: Recibo con ID de venta y detalles
8. **Nueva venta**: Click en "Nueva Venta" para resetear

## 🧪 Testing (Pendiente)

Los tests se implementarán en las siguientes tareas:
- Tests unitarios de componentes (Task 17)
- Tests de integración end-to-end (Task 19)
- Property-based tests (Task 16)

## 🔐 Accesibilidad

- Atributos `aria-label` en botones
- Atributo `aria-busy` durante carga
- Role `alert` en banners de error
- Labels asociados a inputs
- Navegación por teclado

## 📦 Dependencias UI

- **React 19**: Framework de UI
- **Next.js 15**: App Router y SSR
- **Tailwind CSS**: Estilos utility-first
- **TypeScript**: Tipado estricto

## 🚧 Pendientes

- [ ] Implementar `usePriceOverride` en UI
- [ ] Diálogo de confirmación para descuentos
- [ ] Campo de autorización para precio override
- [ ] Validación con Zod en formularios
- [ ] Tests de componentes
- [ ] Tests de integración
