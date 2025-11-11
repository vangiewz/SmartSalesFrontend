import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { Toaster } from 'react-hot-toast'
import { registerSW } from 'virtual:pwa-register'
import { setupSyncListeners } from './utils/syncQueue'

// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
  registerSW({
    onNeedRefresh() {
      console.log('🔄 Nueva versión disponible')
    },
    onOfflineReady() {
      console.log('✅ App lista para funcionar offline')
    },
    onRegisteredSW(swUrl: string) {
      console.log('✅ Service Worker registrado:', swUrl)
    },
    onRegisterError(error: Error) {
      console.error('❌ Error al registrar Service Worker:', error)
    }
  })
  
  // 🆕 Configurar listeners para sincronización automática
  setupSyncListeners();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1f2937',
            color: '#fff',
            borderRadius: '0.5rem',
          },
          success: {
            iconTheme: {
              primary: '#a855f7',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </AuthProvider>
  </StrictMode>,
)
