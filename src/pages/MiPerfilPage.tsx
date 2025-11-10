// src/pages/MiPerfilPage.tsx
import { useEffect, useState } from "react";
import ProtectedLayout from "../components/ProtectedLayout";
import { api } from "../lib/client";
import toast from "react-hot-toast";
import {
  User,
  Shield,
  KeyRound,
  Mail,
  Phone,
  Loader2,
} from "lucide-react";

type UsuarioPerfil = {
  id: string;
  correo: string;
  nombre: string | null;
  telefono: string | null;
  roles: string[];
  roles_ids: number[];
};

export default function MiPerfilPage() {
  const [perfil, setPerfil] = useState<UsuarioPerfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingPerfil, setSavingPerfil] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");

  // =====================
  // Cargar datos de perfil
  // =====================
  const fetchPerfil = async () => {
    try {
      setLoading(true);
      const res = await api.get<UsuarioPerfil>("gestionusuario/mi-perfil/");
      const data = res.data;
      setPerfil(data);
      setNombre(data.nombre ?? "");
      setTelefono(data.telefono ?? "");
    } catch (error) {
      console.error("❌ Error al cargar perfil:", error);
      toast.error("No se pudo cargar tu perfil");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerfil();
  }, []);

  // =====================
  // Guardar cambios perfil
  // =====================
  const handleGuardarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!perfil) return;

    try {
      setSavingPerfil(true);
      const payload: { nombre?: string; telefono?: string | null } = {};
      payload.nombre = nombre.trim();
      payload.telefono = telefono.trim() || null;

      const res = await api.patch<UsuarioPerfil>(
        "gestionusuario/mi-perfil/",
        payload
      );

      setPerfil(res.data);
      toast.success("Perfil actualizado correctamente ✨");
    } catch (error) {
      console.error("❌ Error al actualizar perfil:", error);
      toast.error("No se pudo actualizar tu perfil");
    } finally {
      setSavingPerfil(false);
    }
  };

  // =====================
  // Cambiar contraseña
  // =====================
  const handleCambiarPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !newPasswordConfirm) {
      toast.error("Completa todos los campos de contraseña");
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    try {
      setChangingPassword(true);
      await api.post("gestionusuario/mi-perfil/cambiar-password/", {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirm: newPasswordConfirm,
      });

      toast.success("Contraseña actualizada correctamente 🔐");
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");
      } catch (error: any) {
    console.error("❌ Error al cambiar contraseña:", error);
    const data = error?.response?.data;

    console.log("🔎 Respuesta servidor cambio contraseña:", data);

    const msg =
      data?.supabase_error_description ||  // viene de Supabase (ej: "Invalid login credentials")
      data?.detail ||                      // nuestro mensaje
      "No se pudo cambiar la contraseña";

    toast.error(String(msg));
  } finally {

      setChangingPassword(false);
    }
  };

  // =====================
  // Loading inicial
  // =====================
  if (loading) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">Cargando tu perfil...</p>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  if (!perfil) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-gray-600">
            No se encontró información de tu usuario.
          </p>
        </div>
      </ProtectedLayout>
    );
  }

  // =====================
  // UI principal
  // =====================
  return (
    <ProtectedLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-3 rounded-2xl shadow-lg">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Mi Perfil
              </h1>
              <p className="text-gray-600 mt-1">
                Actualiza tus datos personales y credenciales de acceso
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {perfil.roles.map((rol) => (
              <span
                key={rol}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-200"
              >
                <Shield className="h-3 w-3" />
                {rol}
              </span>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* DATOS PERSONALES */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-purple-600" />
              <h2 className="text-lg font-bold text-gray-900">
                Datos personales
              </h2>
            </div>

            <form className="space-y-4" onSubmit={handleGuardarPerfil}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo
                </label>
                <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="truncate">{perfil.correo}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Tu correo es tu usuario de acceso y no puede modificarse.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                  placeholder="Nombre y apellido"
                  maxLength={120}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 flex-1 px-4 py-2.5 rounded-xl border border-gray-300 focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-purple-500 bg-white">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      className="w-full bg-transparent outline-none text-sm"
                      placeholder="+54 11 1234 5678"
                      maxLength={40}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={savingPerfil}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-xl font-semibold text-sm hover:shadow-lg hover:scale-[1.01] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {savingPerfil && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Guardar cambios
              </button>
            </form>
          </div>

          {/* CAMBIAR CONTRASEÑA */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <KeyRound className="h-5 w-5 text-purple-600" />
              <h2 className="text-lg font-bold text-gray-900">
                Cambiar contraseña
              </h2>
            </div>

            <form className="space-y-4" onSubmit={handleCambiarPassword}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña actual
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nueva contraseña
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                  placeholder="••••••••"
                  minLength={8}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Repetir nueva contraseña
                </label>
                <input
                  type="password"
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                  placeholder="••••••••"
                  minLength={8}
                />
              </div>

              <p className="text-xs text-gray-400">
                La contraseña debe tener al menos 8 caracteres. Por seguridad,
                te recomendamos combinar letras mayúsculas, minúsculas, números
                y símbolos.
              </p>

              <button
                type="submit"
                disabled={changingPassword}
                className="w-full inline-flex items-center justify-center gap-2 bg-purple-100 text-purple-700 px-4 py-3 rounded-xl font-semibold text-sm hover:bg-purple-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {changingPassword && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Actualizar contraseña
              </button>
            </form>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
