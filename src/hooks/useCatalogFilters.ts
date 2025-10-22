// src/hooks/useCatalogFilters.ts
import { useState, useEffect } from 'react'
import { getFiltrosDisponibles } from '../services/catalogoApi'
import type { FiltrosDisponibles } from '../types/catalogo'

interface UseCatalogFiltersState {
  filtros: FiltrosDisponibles | null
  loading: boolean
  error: string | null
}

export function useCatalogFilters() {
  const [state, setState] = useState<UseCatalogFiltersState>({
    filtros: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const data = await getFiltrosDisponibles()
        setState({
          filtros: data,
          loading: false,
          error: null
        })
      } catch (err) {
        console.error('Error al cargar filtros del catálogo:', err)
        const error = err as { response?: { data?: { detail?: string } } }
        setState({
          filtros: null,
          loading: false,
          error: error.response?.data?.detail || 'Error al cargar los filtros'
        })
      }
    }

    loadFilters()
  }, [])

  return state
}
