# 🛒 Sistema POS Sebastian

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)

Proyecto universitario de Arquitectura de Software: Un sistema de Punto de Venta (POS) moderno, funcional y robusto diseñado para la gestión de supermercados o cafeterías.

## ✨ Características Principales

### 🏪 Terminal de Ventas (Modo Cajero)
- **Carrito de Compras Reactivo:** Permite agregar productos, modificar cantidades y calcula automáticamente el IVA (19%) y el subtotal en tiempo real.
- **Validación de Inventario:** El sistema bloquea inteligentemente la venta si se intenta superar el stock físico disponible.
- **Búsqueda Dinámica:** Búsqueda en tiempo real por nombre de producto o código SKU.
- **Modal de Checkout Profesional:** Permite registrar la Cédula del Cliente, seleccionar qué cajero está atendiendo la venta, e incluye una calculadora automática de cambio (devuelta).

### 🛠️ Panel de Administración (Modo Admin)
- **Gestión de Inventario:** Tabla de control para Crear, Editar (Precio/Stock) y Eliminar productos. Todos los cambios se reflejan al instante en la terminal de ventas.
- **Reportes de Ventas:** Historial detallado de cada venta confirmada, incluyendo ingresos totales, cantidad de transacciones y un desglose por ticket.
- **Gestión de Cajeros:** Interfaz para registrar nuevos cajeros, desactivar accesos temporales y gestionar la plantilla de empleados.

### 💾 Persistencia de Datos
Aunque actualmente el proyecto opera como una SPA (Single Page Application) independiente del backend, **cuenta con un sistema de persistencia local robusto** usando `Zustand`. Esto garantiza que los inventarios, las ventas y los usuarios creados sobrevivan aunque se recargue la página.

## 🚀 Cómo ejecutar el proyecto

1. **Instalar dependencias:**
   Asegúrate de tener Node.js instalado, luego abre la terminal en la raíz del proyecto y ejecuta:
   ```bash
   npm install
   ```

2. **Levantar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

3. **Abrir en el navegador:**
   Haz clic en el enlace que aparece en la terminal (generalmente `http://localhost:5173`).

## 🏗️ Próximos Pasos (Arquitectura Hexagonal)
Este Frontend ha sido preparado siguiendo los requerimientos del Spec-Driven Development (SDD) del taller. La estructura está lista para conectarse mediante peticiones `fetch/axios` a la API RESTful de Java (Spring Boot) en el Backend.

---
*Desarrollado para la clase de Codificación y Pruebas de Software.*
