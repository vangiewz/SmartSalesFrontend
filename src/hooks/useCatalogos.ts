// src/hooks/useCatalogos.ts
import { useState, useEffect } from 'react'
import { getMarcas, getTipos } from '../services/productosApi'
import type { Marca, TipoProducto } from '../types/producto'
import toast from 'react-hot-toast'

export function useCatalogos() {
  const [marcas, setMarcas] = useState<Marca[]>([])
  const [tipos, setTipos] = useState<TipoProducto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCatalogos() {
      try {
        // Intentar cargar desde el backend (online) o desde caché (offline)
        const [marcasData, tiposData] = await Promise.all([
          getMarcas(),
          getTipos()
        ])
        setMarcas(marcasData)
        setTipos(tiposData)
      } catch (error) {
        console.error('Error al cargar catálogos:', error)
        
        // Si estamos offline y el Service Worker no tiene caché, usar valores por defecto
        if (!navigator.onLine) {
          console.warn('⚠️ Offline: No se pudieron cargar catálogos desde caché');
          toast.error('Sin conexión. Algunos datos pueden no estar disponibles.', {
            duration: 3000
          });
        } else {
          // Si estamos online pero falló, es un error real
          toast.error('Error al cargar catálogos. Intenta recargar la página.', {
            duration: 4000
          });
        }
        
        // Dejar arrays vacíos para evitar errores en la UI
        setMarcas([])
        setTipos([])
      } finally {
        setLoading(false)
      }
    }

    loadCatalogos()
  }, [])

  return { marcas, tipos, loading }
}
