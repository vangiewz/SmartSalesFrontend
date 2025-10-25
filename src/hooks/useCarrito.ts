// src/hooks/useCarrito.ts

import { useState, useEffect } from 'react';
import { getCantidadTotal } from '../utils/carrito';

export const useCarrito = () => {
  const [cantidadTotal, setCantidadTotal] = useState(0);

  useEffect(() => {
    // Actualizar contador inicial
    setCantidadTotal(getCantidadTotal());

    // Escuchar cambios en el carrito
    const handleUpdate = () => {
      setCantidadTotal(getCantidadTotal());
    };

    window.addEventListener('carritoActualizado', handleUpdate);

    return () => {
      window.removeEventListener('carritoActualizado', handleUpdate);
    };
  }, []);

  return { cantidadTotal };
};
