import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/Home.tsx'
import LoginPage from './pages/Login.tsx'
import RegisterPage from './pages/Register.tsx'
import InicioPage from './pages/Inicio.tsx'
import ForgotPasswordPage from './pages/ForgotPassword.tsx'
import ResetPasswordPage from './pages/ResetPassword.tsx'
import AccesosCuentasPage from './pages/AccesosCuentas.tsx'
import GestionUsuariosPage from './pages/GestionUsuarios.tsx'
import GestionComercialPage from './pages/GestionComercial.tsx'
import GestionProductosPage from './pages/GestionProductos.tsx'

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
      </Routes>
    </BrowserRouter>
  )
}
