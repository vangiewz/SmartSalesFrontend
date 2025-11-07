import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import { StripeProvider } from './components/StripeProvider'
import HomePage from './pages/Home.tsx'
import LoginPage from './pages/Login.tsx'
import RegisterPage from './pages/Register.tsx'
import InicioPage from './pages/Inicio.tsx'
import ForgotPasswordPage from './pages/ForgotPassword.tsx'
import ResetPasswordPage from './pages/ResetPassword.tsx'
import AccesosCuentasPage from './pages/AccesosCuentas.tsx'
import GestionUsuariosPage from './pages/GestionUsuarios.tsx'

// Ambos cambios conservados
import Reportes from './pages/Reportes.tsx'
import ReportesIA from './pages/ReportesIA.tsx'
import GestionComercialPage from './pages/GestionComercial.tsx'
import GestionProductosPage from './pages/GestionProductos.tsx'

// Nuevas páginas de e-commerce
import DireccionesPage from './pages/Direcciones'
import CarritoPage from './pages/Carrito'
import CheckoutPage from './pages/Checkout'
import CompraExitosaPage from './pages/CompraExitosa'
import GestionCliente from './pages/GestionClientes'
import HistoricoVentas from './pages/HistoricoVentas'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route
          path="/inicio"
          element={
            <ProtectedRoute>
              <InicioPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/accesos-cuentas"
          element={
            <ProtectedRoute>
              <AccesosCuentasPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/gestion-usuarios"
          element={
            <ProtectedRoute>
              <GestionUsuariosPage />
            </ProtectedRoute>
          }
        />

          <Route
          path="/historico-ventas"
          element={
            <ProtectedRoute>
              <HistoricoVentas />
            </ProtectedRoute>
          }
        />

        {/* Rutas de reportes (rama reportesIA) */}
        <Route
          path="/reportes"
          element={
            <ProtectedRoute>
              <Reportes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/generar-reporte"
          element={
            <ProtectedRoute>
              <ReportesIA />
            </ProtectedRoute>
          }
        />

        {/* Rutas comerciales (rama main) */}
        <Route
          path="/gestion-comercial"
          element={
            <ProtectedRoute>
              <GestionComercialPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gestion-productos"
          element={
            <ProtectedRoute>
              <GestionProductosPage />
            </ProtectedRoute>
          }
        />

        {/* Rutas de e-commerce */}
        <Route
          path="/direcciones"
          element={
            <ProtectedRoute>
              <DireccionesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/carrito"
          element={
            <ProtectedRoute>
              <CarritoPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <StripeProvider>
                <CheckoutPage />
              </StripeProvider>
            </ProtectedRoute>
          }
        />
        <Route
          path="/compra-exitosa"
          element={
            <ProtectedRoute>
              <CompraExitosaPage />
            </ProtectedRoute>
          }

        />

          <Route
          path="/gestioncliente"
          element={
            <ProtectedRoute>
              <GestionCliente />
            </ProtectedRoute>
          }
          />
      </Routes>
    </BrowserRouter>
  )
}