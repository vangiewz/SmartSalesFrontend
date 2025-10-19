import PublicNavbar from '../components/PublicNavbar'
import { Zap, Shield, Truck, HeadphonesIcon, Sparkles, Star } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100">
      <PublicNavbar />
      
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-20 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full mb-6 shadow-lg">
            <Sparkles className="h-4 w-4 animate-pulse" />
            <span className="text-sm font-semibold">¡Ofertas Increíbles Este Mes!</span>
            <Sparkles className="h-4 w-4 animate-pulse" />
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-4 sm:mb-6 px-2 animate-gradient">
            Los Mejores Electrodomésticos
            <span className="block bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mt-2">
              al Mejor Precio
            </span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-700 mb-6 sm:mb-8 max-w-2xl mx-auto px-4 leading-relaxed">
            Encuentra la tecnología más avanzada para tu hogar. Calidad garantizada y envío rápido a todo el país. 
            <span className="inline-flex items-center gap-1 text-purple-600 font-semibold">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 inline" />
              4.9/5 en reseñas
            </span>
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <a 
              href="/login" 
              className="group bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300 text-base sm:text-lg shadow-lg relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5" />
                Explorar Productos
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </a>
            <a 
              href="/register" 
              className="bg-white border-3 border-purple-600 text-purple-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold hover:bg-purple-50 hover:shadow-xl hover:scale-105 transition-all duration-300 text-base sm:text-lg shadow-lg"
            >
              Crear Cuenta Gratis
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          <div className="group bg-gradient-to-br from-white to-purple-50 p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-purple-100">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:rotate-12 transition-transform shadow-lg">
              <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2 text-purple-900">Última Tecnología</h3>
            <p className="text-gray-700 text-sm sm:text-base">Productos de las mejores marcas con tecnología de punta</p>
          </div>
          
          <div className="group bg-gradient-to-br from-white to-green-50 p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-green-100">
            <div className="bg-gradient-to-br from-green-500 to-emerald-500 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:rotate-12 transition-transform shadow-lg">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2 text-green-900">Garantía Extendida</h3>
            <p className="text-gray-700 text-sm sm:text-base">Todos nuestros productos cuentan con garantía oficial</p>
          </div>
          
          <div className="group bg-gradient-to-br from-white to-pink-50 p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-pink-100">
            <div className="bg-gradient-to-br from-pink-500 to-purple-500 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:rotate-12 transition-transform shadow-lg">
              <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2 text-pink-900">Envío Gratis</h3>
            <p className="text-gray-700 text-sm sm:text-base">Envío sin costo en compras mayores a $500</p>
          </div>
          
          <div className="group bg-gradient-to-br from-white to-orange-50 p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-orange-100">
            <div className="bg-gradient-to-br from-orange-500 to-pink-500 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:rotate-12 transition-transform shadow-lg">
              <HeadphonesIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2 text-orange-900">Soporte 24/7</h3>
            <p className="text-gray-700 text-sm sm:text-base">Atención al cliente siempre disponible para ti</p>
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
            Categorías Populares
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">Encuentra exactamente lo que necesitas</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <div className="group relative overflow-hidden rounded-2xl shadow-xl cursor-pointer h-48 sm:h-56 lg:h-64 transform hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 group-hover:from-purple-700 group-hover:to-pink-600 transition-all"></div>
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600')] bg-cover bg-center opacity-20"></div>
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-yellow-300" />
                <h3 className="text-xl sm:text-2xl font-bold">Refrigeradores</h3>
              </div>
              <p className="text-xs sm:text-sm text-purple-100">La mejor conservación para tus alimentos</p>
            </div>
          </div>
          
          <div className="group relative overflow-hidden rounded-2xl shadow-xl cursor-pointer h-48 sm:h-56 lg:h-64 transform hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-purple-500 to-purple-600 group-hover:from-pink-600 group-hover:to-purple-700 transition-all"></div>
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600')] bg-cover bg-center opacity-20"></div>
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-yellow-300" />
                <h3 className="text-xl sm:text-2xl font-bold">Lavadoras</h3>
              </div>
              <p className="text-xs sm:text-sm text-pink-100">Eficiencia y ahorro de energía</p>
            </div>
          </div>
          
          <div className="group relative overflow-hidden rounded-2xl shadow-xl cursor-pointer h-48 sm:h-56 lg:h-64 sm:col-span-2 md:col-span-1 transform hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 group-hover:from-purple-600 group-hover:to-pink-700 transition-all"></div>
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=600')] bg-cover bg-center opacity-20"></div>
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-yellow-300" />
                <h3 className="text-xl sm:text-2xl font-bold">Microondas</h3>
              </div>
              <p className="text-xs sm:text-sm text-purple-100">Cocina rápida y práctica</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
