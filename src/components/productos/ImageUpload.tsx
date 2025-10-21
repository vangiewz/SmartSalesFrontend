// src/components/productos/ImageUpload.tsx
import { useState, useRef } from 'react'
import { Upload, X, Crop } from 'lucide-react'
import ImageCropModal from './ImageCropModal'

interface ImageUploadProps {
  value: File | null
  onChange: (file: File | null) => void
  preview?: string
  required?: boolean
  error?: string
  aspectRatio?: number // 1 para cuadrado (800x800), 1.33 para 4:3 (800x600)
}

export default function ImageUpload({ onChange, preview, required, error, aspectRatio = 1 }: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string>(preview || '')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showCropModal, setShowCropModal] = useState(false)
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        alert('Solo se permiten imágenes JPG, PNG o WEBP')
        return
      }

      // Validar tamaño (5MB máximo)
      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        alert('La imagen no puede superar 5MB')
        return
      }

      // Crear preview temporal para el crop
      const reader = new FileReader()
      reader.onloadend = () => {
        setTempImageUrl(reader.result as string)
        setShowCropModal(true)
      }
      reader.readAsDataURL(file)

      // Resetear input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleCropComplete = (croppedBlob: Blob, croppedUrl: string) => {
    // Convertir blob a File con nombre único
    const croppedFile = new File([croppedBlob], `producto-${Date.now()}.jpg`, { type: 'image/jpeg' })
    
    setPreviewUrl(croppedUrl)
    onChange(croppedFile)
    setShowCropModal(false)
    setTempImageUrl(null)
  }

  const handleCropCancel = () => {
    setShowCropModal(false)
    setTempImageUrl(null)
  }

  const handleRemove = () => {
    setPreviewUrl(preview || '')
    onChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {previewUrl ? (
        <div className="relative">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-48 object-cover rounded-xl border-2 border-purple-200"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              type="button"
              onClick={handleClick}
              className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors shadow-lg"
              title="Cambiar imagen"
            >
              <Crop className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
              title="Eliminar imagen"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          className="w-full h-48 border-2 border-dashed border-purple-300 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-purple-500 hover:bg-purple-50 transition-colors"
        >
          <Upload className="h-12 w-12 text-purple-400" />
          <div className="text-center">
            <p className="text-sm font-semibold text-purple-700">
              Click para seleccionar imagen
            </p>
            <p className="text-xs text-gray-500 mt-1">
              JPG, PNG o WEBP (máx. 5MB)
            </p>
            <p className="text-xs text-purple-600 font-semibold mt-1">
              ✂️ Se recortará a {aspectRatio === 1 ? '800x800px' : '800x600px'}
            </p>
            {required && (
              <p className="text-xs text-red-500 mt-1">
                * Obligatorio
              </p>
            )}
          </div>
        </button>
      )}

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}

      {/* Modal de recorte */}
      {showCropModal && tempImageUrl && (
        <ImageCropModal
          imageUrl={tempImageUrl}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={aspectRatio}
        />
      )}
    </div>
  )
}
