import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Lock, CheckCircle } from 'lucide-react'
import { api } from '../lib/client'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  function getRecoveryToken(loc: Location): string {
    // 1) Supabase lo entrega en el hash
    const hash = new URLSearchParams(loc.hash.replace(/^#/, ''))
    const type = hash.get('type')
    const access = hash.get('access_token')
    if (type === 'recovery' && access) return access

    // 2) (opcional) Soportar ?token=
    const qs = new URLSearchParams(loc.search)
    return qs.get('token') || ''
  }

  useEffect(() => {
    const t = getRecoveryToken(window.location)
    if (t) {
      setToken(t)
    } else {
      toast.error('Enlace de recuperación inválido o expirado', {
        style: {
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: '#fff',
          fontWeight: 'bold',
        },
      })
    }
  }, []) // una sola vez

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden', {
        style: {
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: '#fff',
          fontWeight: 'bold',
        },
      })
      return
    }

    if (newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres', {
        style: {
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: '#fff',
          fontWeight: 'bold',
        },
      })
      return
    }

    if (!token) {
      toast.error('Token de recuperación no encontrado', {
        style: {
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: '#fff',
          fontWeight: 'bold',
        },
      })
      return
    }

    setLoading(true)
    
    try {
      await api.post('password-reset/confirm/', {
        token: token,
        new_password: newPassword
      })
      
      setSuccess(true)
      
      // Ahora sí, limpia el hash porque ya no lo necesitas
      window.history.replaceState({}, document.title, '/reset-password')
      
      toast.success('¡Contraseña actualizada correctamente!', {
        icon: '✅',
        style: {
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: '#fff',
          fontWeight: 'bold',
        },
        duration: 5000,
      })
      
      setTimeout(() => navigate('/login'), 3000)
      
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } }
      const msg = err?.response?.data?.detail || 
                  'Error al actualizar contraseña. El enlace puede haber expirado.'
      
      toast.error(msg, {
        style: {
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: '#fff',
          fontWeight: 'bold',
        },
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
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
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-purple-900 mb-3">
              ¡Contraseña actualizada!
            </h2>
            
            <p className="text-gray-700 mb-6">
              Tu contraseña ha sido actualizada correctamente. Serás redirigido al inicio de sesión en unos segundos.
            </p>
            
            <Link
              to="/login"
              className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-200"
            >
              Ir al inicio de sesión
            </Link>
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
            Nueva Contraseña
          </h1>
          <p className="text-sm sm:text-base text-gray-700">
            Ingresa tu nueva contraseña
          </p>
        </div>

        <form onSubmit={onSubmit} className="bg-white/90 backdrop-blur-lg rounded-3xl border-2 border-purple-200 p-4 sm:p-6 lg:p-8 shadow-2xl space-y-4 sm:space-y-6">
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2.5 sm:p-3 rounded-2xl shadow-lg">
              <Lock className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-purple-900 mb-1.5 sm:mb-2">
                Nueva Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 h-4 w-4 sm:h-5 sm:w-5" />
                <input
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 lg:py-3 text-sm sm:text-base rounded-xl border-2 border-purple-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">Mínimo 6 caracteres</p>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-purple-900 mb-1.5 sm:mb-2">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 h-4 w-4 sm:h-5 sm:w-5" />
                <input
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 lg:py-3 text-sm sm:text-base rounded-xl border-2 border-purple-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>
          </div>

          <button
            disabled={loading || !token}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-2.5 sm:py-3 text-sm sm:text-base rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
          >
            {loading ? 'Actualizando...' : 'Actualizar contraseña'}
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
