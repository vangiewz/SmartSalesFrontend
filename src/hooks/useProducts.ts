// src/hooks/useProducts.ts
import { useState, useCallback } from 'react'
import { getProductos } from '../services/productosApi'
import type { Producto, ProductoFilters, ProductosResponse } from '../types/producto'
import toast from 'react-hot-toast'
import { getProductoApiError } from '../services/productosApi'

export function useProducts() {
  const [products, setProducts] = useState<Producto[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    count: 0,
    page: 1,
    page_size: 20
  })

  const loadProducts = useCallback(async (filters: ProductoFilters = {}) => {
    setLoading(true)
    try {
      const data: ProductosResponse = await getProductos(filters)
      setProducts(data.results)
      setPagination({
        count: data.count,
        page: data.page,
        page_size: data.page_size
      })
    } catch (error) {
      toast.error(getProductoApiError(error))
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    products,
    loading,
    pagination,
    loadProducts
  }
}
