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
        const [marcasData, tiposData] = await Promise.all([
          getMarcas(),
          getTipos()
        ])
        setMarcas(marcasData)
        setTipos(tiposData)
      } catch (error) {
        toast.error('Error al cargar catálogos')
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    loadCatalogos()
  }, [])

  return { marcas, tipos, loading }
}
