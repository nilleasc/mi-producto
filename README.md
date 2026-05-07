# 🛒 Sistema POS Sebastian

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![Java](https://img.shields.io/badge/java-%23ED8B00.svg?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/spring-%236DB33F.svg?style=for-the-badge&logo=spring&logoColor=white)

Proyecto universitario de Arquitectura de Software: Un sistema de Punto de Venta (POS) moderno, funcional y robusto diseñado para la gestión de supermercados o cafeterías.

![Pantalla de Inicio](screenshots/home.png)

Este repositorio está dividido en dos partes principales bajo los requerimientos de la metodología **Spec-Driven Development (SDD)** y Arquitectura Hexagonal.

## 📂 Estructura del Proyecto

- `pos-frontend/`: Aplicación cliente (Cajero y Administrador) construida con React 19, TypeScript y Zustand.
- `pos-backend/`: API RESTful (En construcción) construida con Java 17 y Spring Boot.
- `.kiro/`: Contiene los archivos de especificación SDD (`requirements.md`, `design.md`, `tasks.md`).

---

## ✨ Características del Frontend (Completado)

Para ver el Frontend en acción, navega a la carpeta `pos-frontend/`.

### 🏪 Terminal de Ventas (Modo Cajero)
![Terminal POS](screenshots/cajero.png)
- **Carrito de Compras Reactivo:** Permite agregar productos, modificar cantidades y calcula automáticamente el IVA (19%) y el subtotal en tiempo real.
- **Validación de Inventario:** El sistema bloquea inteligentemente la venta si se intenta superar el stock físico disponible.
- **Modal de Checkout Profesional:** Permite registrar la Cédula del Cliente, seleccionar qué cajero está atendiendo la venta, e incluye una calculadora automática de cambio.

### 🛠️ Panel de Administración (Modo Admin)
![Panel de Administración](screenshots/admin.png)
- **Gestión de Inventario:** Tabla de control para Crear, Editar (Precio/Stock) y Eliminar productos.
- **Reportes de Ventas:** Historial detallado de cada venta confirmada.
- **Gestión de Cajeros:** Interfaz para registrar nuevos cajeros, desactivar accesos temporales y gestionar la plantilla de empleados.

### 💾 Persistencia de Datos
El frontend cuenta con un sistema de persistencia local robusto usando `Zustand`. Esto garantiza que los inventarios, las ventas y los usuarios creados sobrevivan aunque se recargue la página.

---

## 🚀 Cómo ejecutar el Frontend

1. **Entrar a la carpeta:**
   ```bash
   cd pos-frontend
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Levantar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

4. **Abrir en el navegador:**
   Ve al enlace que aparece en la terminal (ej. `http://localhost:5173`).

---
*Desarrollado para la clase de Codificación y Pruebas de Software por Sebastian.*
