// src/hooks/useCatalogProducts.ts
import { useState, useEffect, useCallback } from 'react'
import { getProductosCatalogo } from '../services/catalogoApi'
import type { ProductoCatalogo, CatalogoFilters } from '../types/catalogo'

interface UseCatalogProductsState {
  productos: ProductoCatalogo[]
  loading: boolean
  error: string | null
  total: number
  currentPage: number
  totalPages: number
  pageSize: number
}

export function useCatalogProducts(initialFilters: CatalogoFilters = {}) {
  const [state, setState] = useState<UseCatalogProductsState>({
    productos: [],
    loading: true,
    error: null,
    total: 0,
    currentPage: 1,
    totalPages: 1,
    pageSize: 12
  })

  const [filters, setFilters] = useState<CatalogoFilters>({
    page: 1,
    page_size: 12,
    ...initialFilters
  })

  const loadProducts = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const response = await getProductosCatalogo(filters)
      setState({
        productos: response.results,
        loading: false,
        error: null,
        total: response.total,
        currentPage: response.page,
        totalPages: response.total_pages,
        pageSize: response.page_size
      })
    } catch (err) {
      console.error('Error al cargar productos del catálogo:', err)
      const error = err as { response?: { data?: { detail?: string } } }
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.response?.data?.detail || 'Error al cargar los productos'
      }))
    }
  }, [filters])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const updateFilters = useCallback((newFilters: Partial<CatalogoFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: newFilters.page ?? 1 // Reset a página 1 si cambian filtros (excepto si se especifica página)
    }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({
      page: 1,
      page_size: state.pageSize
    })
  }, [state.pageSize])

  const changePage = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }, [])

  const changePageSize = useCallback((page_size: number) => {
    setFilters(prev => ({ ...prev, page_size, page: 1 }))
  }, [])

  return {
    ...state,
    filters,
    updateFilters,
    clearFilters,
    changePage,
    changePageSize,
    reload: loadProducts
  }
}
