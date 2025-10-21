// src/components/productos/ImageCropModal.tsx
import { useState, useRef, useCallback } from 'react'
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop'
import { X, Check } from 'lucide-react'

interface ImageCropModalProps {
  imageUrl: string
  onCropComplete: (croppedBlob: Blob, croppedUrl: string) => void
  onCancel: () => void
  aspectRatio?: number // 1 para cuadrado (1:1), 1.33 para 4:3, etc.
}

export default function ImageCropModal({ 
  imageUrl, 
  onCropComplete, 
  onCancel,
  aspectRatio = 1 // Por defecto cuadrado 1:1
}: ImageCropModalProps) {
  const imgRef = useRef<HTMLImageElement>(null)
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<Crop>()

  // Centrar el crop cuando la imagen carga
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    
    const newCrop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspectRatio,
        width,
        height
      ),
      width,
      height
    )
    
    setCrop(newCrop)
    setCompletedCrop(newCrop)
  }, [aspectRatio])

  // Generar el blob de la imagen recortada
  const generateCroppedImage = useCallback(async () => {
    if (!completedCrop || !imgRef.current) return

    const image = imgRef.current
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    // Tamaño estándar de salida: 800x800 para cuadrado, o 800x600 para 4:3
    const outputWidth = 800
    const outputHeight = aspectRatio === 1 ? 800 : 600

    canvas.width = outputWidth
    canvas.height = outputHeight

    // Dibujar la imagen recortada en el canvas
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      outputWidth,
      outputHeight
    )

    // Convertir canvas a blob
    canvas.toBlob(
      (blob) => {
        if (!blob) return
        const croppedUrl = URL.createObjectURL(blob)
        onCropComplete(blob, croppedUrl)
      },
      'image/jpeg',
      0.92 // Calidad del JPEG (92%)
    )
  }, [completedCrop, onCropComplete, aspectRatio])

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[60] overflow-y-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-purple-100">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-purple-900">
              ✂️ Recortar Imagen
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Ajusta el área de recorte para estandarizar la imagen
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Crop Area */}
        <div className="p-4 sm:p-6 max-h-[60vh] overflow-auto">
          <div className="flex justify-center">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspectRatio}
              className="max-w-full"
            >
              <img
                ref={imgRef}
                src={imageUrl}
                alt="Imagen a recortar"
                onLoad={onImageLoad}
                className="max-w-full h-auto"
                style={{ maxHeight: '50vh' }}
              />
            </ReactCrop>
          </div>

          {/* Info */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-3">
            <p className="text-xs sm:text-sm text-blue-800">
              ℹ️ <strong>Formato estándar:</strong> {aspectRatio === 1 ? '800x800px (cuadrado)' : '800x600px (4:3)'}
            </p>
            <p className="text-xs sm:text-sm text-blue-800 mt-1">
              📐 Arrastra las esquinas para ajustar el área de recorte
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-purple-100">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={generateCroppedImage}
            disabled={!completedCrop}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Check className="h-5 w-5" />
            <span>Aplicar Recorte</span>
          </button>
        </div>
      </div>
    </div>
  )
}
