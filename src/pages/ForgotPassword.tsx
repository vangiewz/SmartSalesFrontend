import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Mail, KeyRound } from 'lucide-react'
import { api } from '../lib/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    
    try {
      await api.post('password-reset/request/', {
        email: email.trim().toLowerCase()
      })
      
      setEmailSent(true)
      toast.success('Revisa tu correo electrónico', {
        icon: '📧',
        style: {
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
          color: '#fff',
          fontWeight: 'bold',
        },
        duration: 5000,
      })
    } catch (error: unknown) {
      // El backend siempre retorna 200, pero por si acaso
      console.error('Error:', error)
      toast.error('Ocurrió un error. Intenta nuevamente.', {
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

  if (emailSent) {
    return (
      <div className="min-h-screen grid place-items-center bg-gradient-to-br from-purple-100 via-pink-50 to-purple-200 p-3 sm:p-4 lg:p-6 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl border-2 border-purple-200 p-6 sm:p-8 shadow-2xl text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-4 rounded-full shadow-lg">
                <Mail className="h-10 w-10 text-white" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-purple-900 mb-3">
              ¡Revisa tu correo!
            </h2>
            
            <p className="text-gray-700 mb-4">
              Si el correo <strong>{email}</strong> está registrado, recibirás un enlace para recuperar tu contraseña.
            </p>
            
            <p className="text-sm text-gray-600 mb-6">
              El enlace expirará en 1 hora. Revisa tu bandeja de spam si no lo ves.
            </p>
            
            <div className="space-y-3">
              <Link
                to="/login"
                className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-200"
              >
                Volver al inicio de sesión
              </Link>
              
              <button
                onClick={() => setEmailSent(false)}
                className="w-full text-purple-600 hover:text-pink-600 font-semibold text-sm"
              >
                Enviar otro correo
              </button>
            </div>
          </div>
        </div>
      </div>
    )
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
            Recuperar Contraseña
          </h1>
          <p className="text-sm sm:text-base text-gray-700">
            Ingresa tu correo y te enviaremos un enlace de recuperación
          </p>
        </div>

        <form onSubmit={onSubmit} className="bg-white/90 backdrop-blur-lg rounded-3xl border-2 border-purple-200 p-4 sm:p-6 lg:p-8 shadow-2xl space-y-4 sm:space-y-6">
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2.5 sm:p-3 rounded-2xl shadow-lg">
              <KeyRound className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
          </div>

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

          <button
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-2.5 sm:py-3 text-sm sm:text-base rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
          >
            {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
          </button>

          <div className="text-center text-xs sm:text-sm text-gray-700 pt-3 sm:pt-4 border-t-2 border-purple-100">
            ¿Recordaste tu contraseña?{' '}
            <Link to="/login" className="text-purple-600 hover:text-pink-600 font-bold">
              Iniciar sesión
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
