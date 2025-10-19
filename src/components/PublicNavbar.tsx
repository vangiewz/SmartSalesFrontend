import { Link } from 'react-router-dom'
import { ShoppingBag, LogIn, UserPlus, Sparkles } from 'lucide-react'

export default function PublicNavbar() {
  return (
    <nav className="bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 shadow-xl sticky top-0 z-50 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <Link to="/" className="flex items-center space-x-1.5 sm:space-x-2 text-white hover:scale-105 transition-transform duration-200 group">
            <div className="relative">
              <ShoppingBag className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0 group-hover:rotate-12 transition-transform" />
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
            </div>
            <span className="text-lg sm:text-2xl font-bold whitespace-nowrap bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
              SmartSales
            </span>
          </Link>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <Link 
              to="/login" 
              className="flex items-center gap-1 sm:gap-2 bg-white text-purple-600 px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl text-sm sm:text-base font-semibold hover:bg-purple-50 hover:scale-105 transition-all duration-200 shadow-lg whitespace-nowrap"
            >
              <LogIn className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="hidden xs:inline">Iniciar</span>
              <span className="hidden sm:inline">Sesión</span>
            </Link>
            <Link 
              to="/register" 
              className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl text-sm sm:text-base font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-200 shadow-lg whitespace-nowrap"
            >
              <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="hidden xs:inline">Registro</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
