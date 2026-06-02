'use client';

import { useState, useEffect } from 'react';
import { useDependencies } from '../infrastructure/di/DependencyProvider';
import { Cart } from '../domain/cart/Cart';
import { CartItem } from '../domain/cart/CartItem';
import { agregarItem, quitarItem, actualizarCantidad } from '../domain/logic/cartOperations';
import { calcularSubtotal } from '../domain/logic/cartCalculations';

export function useCart() {
  const { cartStorage } = useDependencies();
  const [cart, setCart] = useState<Cart>({ items: [], total: 0 });

  // Restaurar carrito al montar
  useEffect(() => {
    const carritoRecuperado = cartStorage.recuperar();
    if (carritoRecuperado) {
      setCart(carritoRecuperado);
    }
  }, [cartStorage]);

  // Persistir automáticamente tras cada cambio
  useEffect(() => {
    cartStorage.guardar(cart);
  }, [cart, cartStorage]);

  const agregarProducto = (
    productoId: string,
    nombreProducto: string,
    precioOficial: number,
    cantidad: number
  ) => {
    const nuevoItem: CartItem = {
      productoId,
      nombreProducto,
      precioOficial,
      cantidad,
      precioAplicado: precioOficial,
      subtotal: calcularSubtotal(precioOficial, cantidad),
    };

    const nuevoCarrito = agregarItem(cart, nuevoItem);
    setCart(nuevoCarrito);
  };

  const eliminarItem = (productoId: string) => {
    const nuevoCarrito = quitarItem(cart, productoId);
    setCart(nuevoCarrito);
  };

  const modificarCantidad = (productoId: string, cantidad: number) => {
    const nuevoCarrito = actualizarCantidad(cart, productoId, cantidad);
    setCart(nuevoCarrito);
  };

  const actualizarPrecioOverride = (
    productoId: string,
    precioOverride: number,
    autorizadoPor: string
  ) => {
    const itemsActualizados = cart.items.map(item => {
      if (item.productoId === productoId) {
        const precioAplicado = precioOverride;
        const subtotal = calcularSubtotal(precioAplicado, item.cantidad);
        return {
          ...item,
          precioOverride,
          autorizadoPor,
          precioAplicado,
          subtotal,
        };
      }
      return item;
    });

    const total = itemsActualizados.reduce((acc, item) => acc + item.subtotal, 0);

    const nuevoCarrito: Cart = {
      ...cart,
      items: itemsActualizados,
      total,
    };

    setCart(nuevoCarrito);
  };

  const vaciarCarrito = () => {
    setCart({ items: [], total: 0 });
    cartStorage.limpiar();
  };

  return {
    cart,
    agregarProducto,
    eliminarItem,
    modificarCantidad,
    actualizarPrecioOverride,
    vaciarCarrito,
  };
}
