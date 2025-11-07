import { useAuth } from '../hooks/useAuth';
import { useCarrito } from '../hooks/useCarrito';
import {
  LogOut,
  User,
  ShoppingCart,
  Sparkles,
  Home,
  Menu,
  Shield,
  Package,
  Brain,
  ShieldCheck, // 👈 NUEVO para Garantías
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

type AuthNavbarProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  isDesktop: boolean;
};

export default function AuthNavbar({ open, setOpen, isDesktop }: AuthNavbarProps) {
  const { user, logout } = useAuth();
  const { cantidadTotal } = useCarrito();
  const navigate = useNavigate();

  // Helper: permitir Reportes a admin, vendedor y analista (por flags o nombres en user.roles)
  const normalize = (s: string) =>
    String(s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const hasAnyRole = (names: string[]) => {
    const allowed = names.map(normalize);
    const userRoles = Array.isArray((user as any)?.roles) ? (user as any).roles : [];
    const byName = userRoles.map((r: string) => normalize(r)).some((r: string) => allowed.includes(r));
    const byFlag =
      (allowed.includes('admin') && (user as any)?.is_admin) ||
      (allowed.includes('vendedor') && (user as any)?.is_vendedor) ||
      (allowed.includes('analista') && (user as any)?.is_analista);
    return Boolean(byName || byFlag);
  };

  const canSeeReportes = hasAnyRole(['admin', 'vendedor', 'analista']);
  const canSeeIA = hasAnyRole(['admin', 'analista']); // 👈 NUEVO: solo admin y analista

  // Paleta y glassmorphism
  const sidebarBase =
    'sticky top-0 left-0 h-screen w-72 bg-gradient-to-br from-purple-700/80 via-purple-400/60 to-pink-300/70 shadow-2xl backdrop-blur-xl z-50 flex flex-col border-r border-purple-200/30 transition-transform duration-300';

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Sesión cerrada exitosamente', {
        icon: '👋',
        style: { borderRadius: '12px', background: '#9333ea', color: '#fff' },
      });
      navigate('/');
    } catch {
      toast.error('Error al cerrar sesión', {
        style: { borderRadius: '12px', background: '#ef4444', color: '#fff' },
      });
    }
  };

  return (
    <>
      {/* Botón menú móvil, siempre fijo al viewport */}
      {!isDesktop && !open && (
        <button
          className="fixed bottom-6 left-6 z-[100] bg-gradient-to-br from-purple-600 to-pink-500 p-3 rounded-full shadow-xl text-white hover:scale-110 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
          style={{ position: 'fixed' }}
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
        >
          <Menu className="h-7 w-7" />
        </button>
      )}

      {/* Sidebar móvil */}
      {!isDesktop && open && (
        <div className="fixed inset-0 z-[120] flex">
          <aside
            className="h-full w-72 max-w-full bg-gradient-to-br from-purple-700/80 via-purple-400/60 to-pink-300/70 shadow-2xl backdrop-blur-xl border-r border-purple-200/30 flex flex-col transition-transform duration-300"
            style={{ minWidth: '18rem' }}
          >
            <div className="flex justify-end px-4 pt-4">
              <button
                onClick={() => setOpen(false)}
                className="bg-gradient-to-br from-pink-500 to-purple-600 p-2 rounded-full text-white shadow-lg hover:scale-110 hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
                aria-label="Cerrar menú"
              >
                <Menu className="h-6 w-6 rotate-180" />
              </button>
            </div>

            {/* Logo y usuario */}
            <div className="flex flex-col items-center py-8 px-4 border-b border-purple-200/20">
              <div className="relative mb-2">
                <span className="absolute -top-2 -right-2 animate-pulse">
                  <Sparkles className="h-5 w-5 text-yellow-300" />
                </span>
                <div className="bg-gradient-to-tr from-purple-400 via-pink-300 to-purple-600 rounded-full p-2 shadow-lg">
                  <User className="h-12 w-12 text-white" />
                </div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-700 to-pink-500 bg-clip-text text-transparent mb-1">
                {user?.nombre || user?.correo || 'Usuario'}
              </span>
            </div>

            {/* Menú principal (MÓVIL) */}
            <nav className="flex-1 overflow-y-auto py-8 px-4">
              <ul className="space-y-3">
                <li>
                  <NavLink
                    to="/inicio"
                    className={({ isActive }) =>
                      `flex items-center gap-4 px-5 py-3 rounded-2xl font-semibold text-base transition-all duration-150 ${
                        isActive
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                          : 'text-purple-900 hover:bg-purple-200/40 hover:text-purple-800 hover:scale-105'
                      }`
                    }
                  >
                    <Home className="h-6 w-6" />
                    Inicio
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/carrito"
                    className={({ isActive }) =>
                      `flex items-center gap-4 px-5 py-3 rounded-2xl font-semibold text-base transition-all duration-150 ${
                        isActive
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                          : 'text-purple-900 hover:bg-purple-200/40 hover:text-purple-800 hover:scale-105'
                      }`
                    }
                  >
                    <ShoppingCart className="h-6 w-6" />
                    Carrito
                    {cantidadTotal > 0 && (
                      <span className="ml-auto bg-pink-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg">
                        {cantidadTotal}
                      </span>
                    )}
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/gestion-comercial"
                    className={({ isActive }) =>
                      `flex items-center gap-4 px-5 py-3 rounded-2xl font-semibold text-base transition-all duration-150 ${
                        isActive
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                          : 'text-purple-900 hover:bg-purple-200/40 hover:text-purple-800 hover:scale-105'
                      }`
                    }
                  >
                    <Package className="h-6 w-6" />
                    Gestión Comercial
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/garantia"
                    className={({ isActive }) =>
                      `flex items-center gap-4 px-5 py-3 rounded-2xl font-semibold text-base transition-all duration-150 ${
                        isActive
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                          : 'text-purple-900 hover:bg-purple-200/40 hover:text-purple-800 hover:scale-105'
                      }`
                    }
                  >
                    <ShieldCheck className="h-6 w-6" />
                    Gestión de garantías
                  </NavLink>
                </li>

                {/* SOLO ADMIN: Accesos y Cuentas */}
                {user?.is_admin && (
                  <li>
                    <NavLink
                      to="/accesos-cuentas"
                      className={({ isActive }) =>
                        `flex items-center gap-4 px-5 py-3 rounded-2xl font-semibold text-base transition-all duration-150 ${
                          isActive
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                            : 'text-purple-900 hover:bg-purple-200/40 hover:text-purple-800 hover:scale-105'
                        }`
                      }
                    >
                      <Shield className="h-6 w-6" />
                      Accesos y Cuentas
                    </NavLink>
                  </li>
                )}

                {/* ADMIN, VENDEDOR o ANALISTA: Reportes */}
                {canSeeReportes && (
                  <li>
                    <NavLink
                      to="/reportes"
                      className={({ isActive }) =>
                        `flex items-center gap-4 px-5 py-3 rounded-2xl font-semibold text-base transition-all duration-150 ${
                          isActive
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                            : 'text-purple-900 hover:bg-purple-200/40 hover:text-purple-800 hover:scale-105'
                        }`
                      }
                    >
                      <Shield className="h-6 w-6" />
                      Reportes
                    </NavLink>
                  </li>
                )}

                {/* ADMIN o ANALISTA: Dashboard IA  */}
                {canSeeIA && (
                  <li>
                    <NavLink
                      to="/dashboard-ia"
                      className={({ isActive }) =>
                        `flex items-center gap-4 px-5 py-3 rounded-2xl font-semibold text-base transition-all duration-150 ${
                          isActive
                            ? 'bg-gradient-to-r from-indigo-600 to-emerald-500 text-white shadow-lg scale-105'
                            : 'text-purple-900 hover:bg-emerald-200/40 hover:text-emerald-700 hover:scale-105'
                        }`
                      }
                    >
                      <Brain className="h-6 w-6" />
                      Dashboard e IA
                    </NavLink>
                  </li>
                )}
              </ul>
            </nav>

            {/* Logout */}
            <div className="px-4 py-7 border-t border-purple-200/20">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-4 justify-center bg-gradient-to-r from-red-500 to-pink-600 text-white px-5 py-3 rounded-2xl text-base font-semibold hover:shadow-2xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all duration-200 shadow-lg"
              >
                <LogOut className="h-6 w-6" />
                Salir
              </button>
            </div>
          </aside>

          {/* Fondo para cerrar tocando fuera */}
          <div className="flex-1 bg-black/30" onClick={() => setOpen(false)} />
        </div>
      )}

      {/* Sidebar DESKTOP */}
      {isDesktop && (
        <aside className={sidebarBase} style={{ minWidth: '18rem' }}>
          {/* Logo y usuario */}
          <div className="flex flex-col items-center py-8 px-4 border-b border-purple-200/20">
            <div className="relative mb-2">
              <span className="absolute -top-2 -right-2 animate-pulse">
                <Sparkles className="h-5 w-5 text-yellow-300" />
              </span>
              <div className="bg-gradient-to-tr from-purple-400 via-pink-300 to-purple-600 rounded-full p-2 shadow-lg">
                <User className="h-12 w-12 text-white" />
              </div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-700 to-pink-500 bg-clip-text text-transparent mb-1">
              {user?.nombre || user?.correo || 'Usuario'}
            </span>
          </div>

          {/* Menú principal (DESKTOP) */}
          <nav className="flex-1 overflow-y-auto py-8 px-4">
            <ul className="space-y-3">
              <li>
                <NavLink
                  to="/inicio"
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-5 py-3 rounded-2xl font-semibold text-base transition-all duration-150 ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                        : 'text-purple-900 hover:bg-purple-200/40 hover:text-purple-800 hover:scale-105'
                    }`
                  }
                >
                  <Home className="h-6 w-6" />
                  Inicio
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/carrito"
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-5 py-3 rounded-2xl font-semibold text-base transition-all duration-150 ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                        : 'text-purple-900 hover:bg-purple-200/40 hover:text-purple-800 hover:scale-105'
                    }`
                  }
                >
                  <ShoppingCart className="h-6 w-6" />
                  Carrito
                  {cantidadTotal > 0 && (
                    <span className="ml-auto bg-pink-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg">
                      {cantidadTotal}
                    </span>
                  )}
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/gestion-comercial"
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-5 py-3 rounded-2xl font-semibold text-base transition-all duration-150 ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                        : 'text-purple-900 hover:bg-purple-200/40 hover:text-purple-800 hover:scale-105'
                    }`
                  }
                >
                  <Package className="h-6 w-6" />
                  Gestión Comercial
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/garantia"
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-5 py-3 rounded-2xl font-semibold text-base transition-all duration-150 ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                        : 'text-purple-900 hover:bg-purple-200/40 hover:text-purple-800 hover:scale-105'
                    }`
                  }
                >
                  <ShieldCheck className="h-6 w-6" />
                  Gestión de garantías
                </NavLink>
              </li>

              {/* SOLO ADMIN: Accesos y Cuentas */}
              {user?.is_admin && (
                <li>
                  <NavLink
                    to="/accesos-cuentas"
                    className={({ isActive }) =>
                      `flex items-center gap-4 px-5 py-3 rounded-2xl font-semibold text-base transition-all duration-150 ${
                        isActive
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                          : 'text-purple-900 hover:bg-purple-200/40 hover:text-purple-800 hover:scale-105'
                      }`
                    }
                  >
                    <Shield className="h-6 w-6" />
                    Accesos y Cuentas
                  </NavLink>
                </li>
              )}

              {/* ADMIN, VENDEDOR o ANALISTA: Reportes */}
              {canSeeReportes && (
                <li>
                  <NavLink
                    to="/reportes"
                    className={({ isActive }) =>
                      `flex items-center gap-4 px-5 py-3 rounded-2xl font-semibold text-base transition-all duration-150 ${
                        isActive
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                          : 'text-purple-900 hover:bg-purple-200/40 hover:text-purple-800 hover:scale-105'
                      }`
                    }
                  >
                    <Shield className="h-6 w-6" />
                    Reportes
                  </NavLink>
                </li>
              )}

              {/* ADMIN o ANALISTA: Dashboard IA */}
              {canSeeIA && (
                <li>
                  <NavLink
                    to="/iadashboard"
                    className={({ isActive }) =>
                      `flex items-center gap-4 px-5 py-3 rounded-2xl font-semibold text-base transition-all duration-150 ${
                        isActive
                          ? 'bg-gradient-to-r from-indigo-600 to-emerald-500 text-white shadow-lg scale-105'
                          : 'text-purple-900 hover:bg-emerald-200/40 hover:text-emerald-700 hover:scale-105'
                      }`
                    }
                  >
                    <Brain className="h-6 w-6" />
                    Dashboard e IA
                  </NavLink>
                </li>
              )}
            </ul>
          </nav>

          {/* Logout */}
          <div className="px-4 py-7 border-t border-purple-200/20">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 justify-center bg-gradient-to-r from-red-500 to-pink-600 text-white px-5 py-3 rounded-2xl text-base font-semibold hover:shadow-2xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all duration-200 shadow-lg"
            >
              <LogOut className="h-6 w-6" />
              Salir
            </button>
          </div>
        </aside>
      )}
    </>
  );
}
