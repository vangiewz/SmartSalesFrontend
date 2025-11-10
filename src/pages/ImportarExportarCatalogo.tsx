// src/pages/ImportarExportarCatalogo.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileSpreadsheet, Download, Upload, FileText, CheckCircle, XCircle, AlertCircle, Package } from 'lucide-react'
import { toast } from 'react-hot-toast'
import ProtectedLayout from '../components/ProtectedLayout'
import { useAuth } from '../hooks/useAuth'
import {
  descargarPlantilla,
  importarCatalogo,
  exportarCatalogo,
  type ImportarResultado
} from '../services/catalogoApi'

export default function ImportarExportarCatalogo() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Verificar permisos
  const is_vendedor = user?.is_vendedor || false

  useEffect(() => {
    if (!is_vendedor) {
      toast.error('Solo los vendedores pueden gestionar el catálogo')
      navigate('/gestion-comercial')
    }
  }, [is_vendedor, navigate])

  // Estados
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null)
  const [importando, setImportando] = useState(false)
  const [exportando, setExportando] = useState(false)
  const [descargandoPlantilla, setDescargandoPlantilla] = useState(false)
  const [resultadoImportacion, setResultadoImportacion] = useState<ImportarResultado | null>(null)

  // Descargar plantilla
  const handleDescargarPlantilla = async () => {
    setDescargandoPlantilla(true)
    try {
      await descargarPlantilla()
      toast.success('Plantilla descargada exitosamente', { icon: '📥' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al descargar plantilla'
      toast.error(message)
    } finally {
      setDescargandoPlantilla(false)
    }
  }

  // Exportar catálogo
  const handleExportarCatalogo = async () => {
    setExportando(true)
    try {
      await exportarCatalogo()
      toast.success('Catálogo exportado exitosamente', { icon: '📤' })
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: { detail?: string } } }
      
      // Manejo específico para 404 (sin productos)
      if (err.response?.status === 404) {
        toast.error('No hay productos en el catálogo para exportar', {
          icon: '📭',
          duration: 4000,
          style: {
            borderRadius: '12px',
            background: '#f59e0b',
            color: '#fff',
          }
        })
      } else {
        const message = err.response?.data?.detail || 'Error al exportar catálogo'
        toast.error(message, { icon: '❌' })
      }
    } finally {
      setExportando(false)
    }
  }

  // Seleccionar archivo
  const handleSeleccionarArchivo = (event: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = event.target.files?.[0]
    if (!archivo) return

    if (!archivo.name.endsWith('.xlsx')) {
      toast.error('Solo se permiten archivos Excel (.xlsx)')
      return
    }

    setArchivoSeleccionado(archivo)
    setResultadoImportacion(null)
  }

  // Importar catálogo
  const handleImportarCatalogo = async () => {
    if (!archivoSeleccionado) {
      toast.error('Selecciona un archivo Excel primero')
      return
    }

    setImportando(true)
    try {
      const resultado = await importarCatalogo(archivoSeleccionado)
      setResultadoImportacion(resultado)

      if (resultado.exitosos > 0) {
        toast.success(
          `✅ ${resultado.exitosos} producto(s) importado(s) exitosamente`,
          { duration: 5000 }
        )
      }

      if (resultado.fallidos > 0) {
        toast.error(
          `⚠️ ${resultado.fallidos} producto(s) con errores`,
          { duration: 5000 }
        )
      }

      // Limpiar archivo seleccionado
      setArchivoSeleccionado(null)
      const fileInput = document.getElementById('file-input') as HTMLInputElement
      if (fileInput) fileInput.value = ''
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: { detail?: string; error?: string } } }
      
      let message = 'Error al importar catálogo'
      
      if (err.response?.status === 400) {
        message = err.response?.data?.detail || err.response?.data?.error || 'Archivo inválido o con errores'
      } else if (err.response?.status === 404) {
        message = 'No se encontraron marcas o tipos de productos en el sistema'
      } else if (err.response?.data?.detail) {
        message = err.response.data.detail
      }
      
      toast.error(message, { icon: '❌', duration: 5000 })
      setResultadoImportacion(null)
    } finally {
      setImportando(false)
    }
  }

  if (!is_vendedor) {
    return null
  }

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-white p-3 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-teal-600 to-cyan-600 p-3 rounded-2xl shadow-lg">
                <FileSpreadsheet className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600">
                  📊 Importar/Exportar Catálogo
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Gestiona tu catálogo de productos de forma masiva con archivos Excel
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card 1: Descargar Plantilla */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-200 hover:shadow-2xl transition-all">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    1. Descargar Plantilla
                  </h2>
                  <p className="text-sm text-gray-600">
                    Descarga la plantilla Excel con el formato correcto para importar productos
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2 text-sm">📋 La plantilla incluye:</h3>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>✓ Formato de columnas requeridas</li>
                  <li>✓ Ejemplos de productos pre-llenados</li>
                  <li>✓ Lista de marcas disponibles</li>
                  <li>✓ Lista de tipos de productos</li>
                  <li>✓ Instrucciones detalladas</li>
                </ul>
              </div>

              <button
                onClick={handleDescargarPlantilla}
                disabled={descargandoPlantilla}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Download className="h-5 w-5" />
                {descargandoPlantilla ? 'Descargando...' : 'Descargar Plantilla'}
              </button>
            </div>

            {/* Card 2: Exportar Catálogo */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-green-200 hover:shadow-2xl transition-all">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl">
                  <Package className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    2. Exportar Catálogo
                  </h2>
                  <p className="text-sm text-gray-600">
                    Descarga todos tus productos actuales en formato Excel
                  </p>
                </div>
              </div>

              <div className="bg-green-50 rounded-xl p-4 mb-4 border border-green-200">
                <h3 className="font-semibold text-green-900 mb-2 text-sm">📦 El archivo incluye:</h3>
                <ul className="text-xs text-green-800 space-y-1">
                  <li>✓ Todos tus productos actuales</li>
                  <li>✓ Información completa de cada producto</li>
                  <li>✓ Formato profesional con colores</li>
                  <li>✓ Totales calculados automáticamente</li>
                  <li>✓ Listo para modificar y reimportar</li>
                </ul>
              </div>

              <button
                onClick={handleExportarCatalogo}
                disabled={exportando}
                className="w-full py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Download className="h-5 w-5" />
                {exportando ? 'Exportando...' : 'Exportar Mi Catálogo'}
              </button>
            </div>
          </div>

          {/* Card 3: Importar Catálogo */}
          <div className="mt-6 bg-white rounded-2xl shadow-xl p-6 border-2 border-teal-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-3 rounded-xl">
                <Upload className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  3. Importar Productos
                </h2>
                <p className="text-sm text-gray-600">
                  Sube tu archivo Excel con los productos a importar (máximo 1000 productos)
                </p>
              </div>
            </div>

            {/* Instrucciones */}
            <div className="bg-amber-50 rounded-xl p-4 mb-6 border border-amber-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-900 mb-2 text-sm">⚠️ Importante:</h3>
                  <ul className="text-xs text-amber-800 space-y-1">
                    <li>• Usa la plantilla descargada para evitar errores</li>
                    <li>• Las imágenes NO se importan, debes agregarlas después en "Gestionar Productos"</li>
                    <li>• Las marcas y tipos deben existir en el sistema</li>
                    <li>• Si una fila tiene error, las demás se procesarán normalmente</li>
                    <li>• Recibirás un informe detallado de éxitos y errores</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Área de carga */}
            <div className="space-y-4">
              <div className="border-2 border-dashed border-teal-300 rounded-xl p-6 text-center hover:border-teal-400 transition-colors">
                <input
                  id="file-input"
                  type="file"
                  accept=".xlsx"
                  onChange={handleSeleccionarArchivo}
                  className="hidden"
                />
                <label
                  htmlFor="file-input"
                  className="cursor-pointer flex flex-col items-center gap-3"
                >
                  <div className="bg-teal-100 p-4 rounded-full">
                    <Upload className="h-8 w-8 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      {archivoSeleccionado ? archivoSeleccionado.name : 'Haz clic para seleccionar archivo'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Solo archivos Excel (.xlsx)
                    </p>
                  </div>
                </label>
              </div>

              {archivoSeleccionado && (
                <button
                  onClick={handleImportarCatalogo}
                  disabled={importando}
                  className="w-full py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Upload className="h-6 w-6" />
                  {importando ? 'Importando...' : '🚀 Importar Productos'}
                </button>
              )}
            </div>
          </div>

          {/* Resultados de Importación */}
          {resultadoImportacion && (
            <div className="mt-6 bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Resultados de la Importación</h2>

              {/* Resumen */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <p className="text-sm text-blue-600 mb-1">Total Procesados</p>
                  <p className="text-3xl font-bold text-blue-900">
                    {resultadoImportacion.total_procesados}
                  </p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <p className="text-sm text-green-600 mb-1">Exitosos</p>
                  <p className="text-3xl font-bold text-green-900">
                    {resultadoImportacion.exitosos}
                  </p>
                </div>
                <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                  <p className="text-sm text-red-600 mb-1">Con Errores</p>
                  <p className="text-3xl font-bold text-red-900">
                    {resultadoImportacion.fallidos}
                  </p>
                </div>
              </div>

              {/* Productos Creados */}
              {resultadoImportacion.productos_creados.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Productos Creados Exitosamente ({resultadoImportacion.productos_creados.length})
                  </h3>
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200 max-h-60 overflow-y-auto">
                    <div className="space-y-2">
                      {resultadoImportacion.productos_creados.map(producto => (
                        <div
                          key={producto.id}
                          className="flex items-center justify-between p-2 bg-white rounded-lg text-sm"
                        >
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{producto.nombre}</p>
                            <p className="text-xs text-gray-500">
                              Fila {producto.fila} • Stock: {producto.stock}
                            </p>
                          </div>
                          <span className="font-bold text-green-600">
                            ${producto.precio.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Errores */}
              {resultadoImportacion.errores.length > 0 && (
                <div>
                  <h3 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                    <XCircle className="h-5 w-5" />
                    Errores Encontrados ({resultadoImportacion.errores.length})
                  </h3>
                  <div className="bg-red-50 rounded-xl p-4 border border-red-200 max-h-60 overflow-y-auto">
                    <div className="space-y-3">
                      {resultadoImportacion.errores.map((error, index) => (
                        <div
                          key={index}
                          className="p-3 bg-white rounded-lg border-l-4 border-red-500"
                        >
                          <div className="flex items-start gap-2 mb-2">
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-semibold">
                              Fila {error.fila}
                            </span>
                          </div>
                          <p className="text-sm text-red-700 font-medium mb-2">{error.error}</p>
                          {error.datos && Object.keys(error.datos).length > 0 && (
                            <div className="text-xs text-gray-600 bg-gray-50 rounded p-2">
                              <p className="font-semibold mb-1">Datos recibidos:</p>
                              <div className="space-y-0.5">
                                {Object.entries(error.datos).map(([key, value]) => (
                                  <p key={key}>
                                    <span className="font-medium">{key}:</span> {String(value)}
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Información adicional */}
          <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
            <h3 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              💡 Consejos para una importación exitosa
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-purple-800">
              <div className="flex gap-2">
                <span className="text-purple-600 font-bold">1.</span>
                <p>Descarga primero la plantilla para ver el formato correcto</p>
              </div>
              <div className="flex gap-2">
                <span className="text-purple-600 font-bold">2.</span>
                <p>Verifica que las marcas y tipos existan en el sistema</p>
              </div>
              <div className="flex gap-2">
                <span className="text-purple-600 font-bold">3.</span>
                <p>Asegúrate de completar todos los campos obligatorios</p>
              </div>
              <div className="flex gap-2">
                <span className="text-purple-600 font-bold">4.</span>
                <p>Revisa el informe de errores para corregir productos fallidos</p>
              </div>
              <div className="flex gap-2">
                <span className="text-purple-600 font-bold">5.</span>
                <p>Puedes importar hasta 1000 productos a la vez</p>
              </div>
              <div className="flex gap-2">
                <span className="text-purple-600 font-bold">6.</span>
                <p>Las imágenes deben agregarse después en "Gestionar Productos"</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}
