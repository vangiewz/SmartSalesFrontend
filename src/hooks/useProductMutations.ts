// src/hooks/useProductMutations.ts
import { useState } from 'react';
import { createProducto, updateProducto } from '../services/productosApi';
import { addOperationToQueue } from '../utils/syncQueue';
import type { ProductoFormData } from '../types/producto';
import toast from 'react-hot-toast';

/**
 * Invalida el caché de productos en el Service Worker
 * Esto fuerza a que la siguiente petición GET vaya al servidor
 */
async function invalidateProductsCache() {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    for (const cacheName of cacheNames) {
      if (cacheName.includes('api-cache')) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        for (const request of requests) {
          if (request.url.includes('gestionproducto')) {
            console.log('🗑️ Invalidando caché:', request.url);
            await cache.delete(request);
          }
        }
      }
    }
  }
}

export function useProductMutations() {
  const [loading, setLoading] = useState(false);

  /**
   * Crear producto con soporte offline
   * Si hay internet: crea directamente en el backend
   * Si NO hay internet: guarda en cola para sincronizar después
   */
  const createProduct = async (data: ProductoFormData) => {
    setLoading(true);
    
    try {
      if (navigator.onLine) {
        // Con internet: crear directamente (comportamiento actual)
        const result = await createProducto(data);
        
        // 🔥 INVALIDAR CACHÉ para forzar que la siguiente petición vaya al servidor
        await invalidateProductsCache();
        
        // ❌ NO mostrar toast aquí, lo muestra el componente
        return result;
      } else {
        // Sin internet: guardar en cola
        // Convertir imagen a base64 para almacenar offline
        const imageBase64 = data.imagen ? await fileToBase64(data.imagen) : null;
        
        await addOperationToQueue(
          'producto',
          'create',
          'gestionproducto/', // ✅ Endpoint correcto
          'POST',
          {
            ...data,
            imagen: imageBase64, // Guardar como base64
            imagen_filename: data.imagen?.name
          }
        );
        
        toast.success('Producto guardado. Se creará cuando recuperes conexión', {
          icon: '📡',
          duration: 4000
        });
        
        return null; // No hay ID aún
      }
    } catch (error) {
      console.error('Error al crear producto:', error);
      // ❌ NO mostrar toast de error aquí, lo maneja el componente
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Actualizar producto con soporte offline
   */
  const updateProduct = async (id: number, data: ProductoFormData) => {
    setLoading(true);
    
    try {
      if (navigator.onLine) {
        // Con internet: actualizar directamente
        const result = await updateProducto(id, data);
        
        // 🔥 INVALIDAR CACHÉ para forzar que la siguiente petición vaya al servidor
        await invalidateProductsCache();
        
        // ❌ NO mostrar toast aquí, lo muestra el componente
        return result;
      } else {
        // Sin internet: guardar en cola
        const imageBase64 = data.imagen instanceof File 
          ? await fileToBase64(data.imagen)
          : data.imagen; // Ya es base64 o URL
        
        await addOperationToQueue(
          'producto',
          'update',
          `gestionproducto/${id}/`, // ✅ Endpoint correcto
          'PATCH', // ✅ Usar PATCH en lugar de PUT
          {
            ...data,
            imagen: imageBase64,
            imagen_filename: data.imagen instanceof File ? data.imagen.name : undefined
          }
        );
        
        toast.success('Cambios guardados. Se actualizarán cuando recuperes conexión', {
          icon: '📡',
          duration: 4000
        });
        
        return null;
      }
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      // ❌ NO mostrar toast de error aquí, lo maneja el componente
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    createProduct,
    updateProduct,
    loading
  };
}

/**
 * Eliminar producto con soporte offline
 */
export function useProductDelete() {
  const [loading, setLoading] = useState(false);
  
  const deleteProduct = async (id: number) => {
    setLoading(true);
    
    try {
      if (navigator.onLine) {
        // Con internet: eliminar directamente
        const { deleteProducto } = await import('../services/productosApi');
        await deleteProducto(id);
        
        // 🔥 INVALIDAR CACHÉ para forzar que la siguiente petición vaya al servidor
        await invalidateProductsCache();
        
        // ❌ NO mostrar toast aquí, lo muestra el componente
      } else {
        // Sin internet: guardar en cola
        await addOperationToQueue(
          'producto',
          'delete',
          `gestionproducto/${id}/`,
          'DELETE'
        );
        
        toast.success('Eliminación guardada. Se aplicará cuando recuperes conexión', {
          icon: '📡',
          duration: 4000
        });
      }
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      // ❌ NO mostrar toast de error aquí, lo maneja el componente
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    deleteProduct,
    loading
  };
}

/**
 * Convierte un archivo a base64
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}
