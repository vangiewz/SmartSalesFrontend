import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'
import { LogIn, Mail, Lock } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email.trim().toLowerCase(), password)
      toast.success(`¡Bienvenido!`, {
        icon: '🎉',
        style: {
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
          color: '#fff',
          fontWeight: 'bold',
        },
      })
      navigate('/dashboard')
    } catch (error: unknown) {
      toast.error((error as Error)?.message || 'Error al iniciar sesión', {
        style: {
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: '#fff',
          fontWeight: 'bold',
        },
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-purple-100 via-pink-50 to-purple-200 p-3 sm:p-4 lg:p-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            SmartSales
          </h1>
          <p className="text-sm sm:text-base text-gray-700">Inicia sesión para continuar</p>
        </div>

        <form onSubmit={onSubmit} className="bg-white/90 backdrop-blur-lg rounded-3xl border-2 border-purple-200 p-4 sm:p-6 lg:p-8 shadow-2xl space-y-4 sm:space-y-6">
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2.5 sm:p-3 rounded-2xl shadow-lg">
              <LogIn className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-purple-900 mb-1.5 sm:mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 h-4 w-4 sm:h-5 sm:w-5" />
                <input
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 lg:py-3 text-sm sm:text-base rounded-xl border-2 border-purple-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-purple-900 mb-1.5 sm:mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 h-4 w-4 sm:h-5 sm:w-5" />
                <input
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 lg:py-3 text-sm sm:text-base rounded-xl border-2 border-purple-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-2.5 sm:py-3 text-sm sm:text-base rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>

          <div className="text-center text-xs sm:text-sm text-gray-700 pt-3 sm:pt-4 border-t-2 border-purple-100">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-purple-600 hover:text-pink-600 font-bold">
              Regístrate aquí
            </Link>
          </div>
        </form>

        <div className="text-center mt-4 sm:mt-6">
          <Link to="/" className="text-xs sm:text-sm text-gray-700 hover:text-purple-600 font-semibold">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
