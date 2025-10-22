// src/components/productos/ProductSkeleton.tsx

export default function ProductSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border-2 border-purple-100 p-4 animate-pulse">
          {/* Imagen skeleton */}
          <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl mb-4"></div>
          
          {/* Nombre skeleton */}
          <div className="h-6 bg-purple-100 rounded-lg mb-3 w-3/4"></div>
          
          {/* Marca skeleton */}
          <div className="h-4 bg-purple-50 rounded mb-2 w-1/2"></div>
          
          {/* Precio skeleton */}
          <div className="h-8 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg mb-3 w-2/3"></div>
          
          {/* Stock skeleton */}
          <div className="h-6 bg-purple-50 rounded-full mb-4 w-1/3"></div>
          
          {/* Botones skeleton */}
          <div className="flex gap-2">
            <div className="flex-1 h-10 bg-purple-100 rounded-xl"></div>
            <div className="flex-1 h-10 bg-red-100 rounded-xl"></div>
          </div>
        </div>
      ))}
    </div>
  )
}
