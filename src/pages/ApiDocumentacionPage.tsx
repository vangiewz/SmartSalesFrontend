import { useEffect, useState } from "react";
import { Code2, Server, FileCode2 } from "lucide-react";
import ProtectedLayout from "../components/ProtectedLayout";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useAllowedRoles } from "../hooks/useAllowedRoles";

type Endpoint = {
  path: string;
  view: string;
  name: string;
};

export default function ApiDocumentacionPage() {
  const { isAllowed, loading } = useAllowedRoles(["admin", "desarrollador"]);
  const [loadingDocs, setLoadingDocs] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoadingDocs(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading)
    return (
      <ProtectedLayout>
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </ProtectedLayout>
    );

  if (!isAllowed)
    return (
      <ProtectedLayout>
        <div className="max-w-3xl mx-auto py-12 text-center">
          <p className="text-red-600 font-semibold">
            🚫 No tienes permisos para consultar la documentación técnica.
          </p>
          <p className="text-gray-500 text-sm mt-1">
            Solo los usuarios con rol Administrador o Desarrollador pueden acceder a Swagger UI.
          </p>
        </div>
      </ProtectedLayout>
    );

  const endpoints: Record<string, Endpoint[]> = {
    "AI Reports": [
      { path: "/api/ai-reports/", view: "APIRootView", name: "api-root" },
      { path: "/api/ai-reports/plantillas/", view: "PlantillaReporteViewSet", name: "plantillas-list" },
      { path: "/api/ai-reports/run", view: "RunReportView", name: "run-report" },
      { path: "/api/ai-reports/run-audio", view: "RunAudioReportView", name: "run-audio-report" },
    ],
    "Bitácora": [
      { path: "/api/bitacora/", view: "BitacoraListView", name: "bitacora-list" },
      { path: "/api/bitacora/<int:pk>/", view: "BitacoraDetailView", name: "bitacora-detail" },
    ],
    "Carrito Voz": [
      { path: "/api/carrito-voz/carrito-voz/", view: "ArmarCarritoVozAPIView", name: "carrito-voz" },
      { path: "/api/carrito-voz/productos-carrito/", view: "ProductosCarritoAPIView", name: "productos-carrito" },
    ],
    "Garantías": [
      { path: "/api/garantia/claims/", view: "ClaimListCreateView", name: "claims_list_create" },
      { path: "/api/garantia/evaluar/<int:garantia_id>/", view: "ClaimEvaluateView", name: "evaluar_garantia" },
      { path: "/api/garantia/mis/", view: "ClaimListCreateView", name: "mis_garantias" },
    ],
    "Gestión Clientes": [
      { path: "/api/gestionclientes/clientes/", view: "ClienteViewSet", name: "cliente-list" },
      { path: "/api/gestionclientes/clientes/<pk>/", view: "ClienteViewSet", name: "cliente-detail" },
    ],
    "Gestión Producto": [
      { path: "/api/gestionproducto/", view: "ProductoListCreateView", name: "gp_list_create" },
      { path: "/api/gestionproducto/<int:pk>/", view: "ProductoDetailView", name: "gp_detail" },
      { path: "/api/gestionproducto/marcas/", view: "MarcaListView", name: "gp_marcas" },
      { path: "/api/gestionproducto/tipos/", view: "TipoProductoListView", name: "gp_tipos" },
    ],
    "Gestión Usuario": [
      { path: "/api/gestionusuario/usuarios/", view: "UsuariosListView", name: "usuarios_list" },
      { path: "/api/gestionusuario/usuarios/<uuid:user_id>/roles/", view: "UsuarioRolesView", name: "usuario_roles" },
    ],
    "Ventas e IA": [
      { path: "/api/ml/config/", view: "ModeloPrediccionConfigView", name: "ml_config" },
      { path: "/api/ml/train/", view: "TrainModeloView", name: "ml_train" },
      { path: "/api/ml/predict/", view: "PrediccionesModeloView", name: "ml_predict" },
    ],
    "Pagos": [
      { path: "/api/pagos/iniciar-checkout/", view: "IniciarCheckoutView", name: "iniciar-checkout" },
      { path: "/api/pagos/confirmar-pago/", view: "ConfirmarPagoView", name: "confirmar-pago" },
      { path: "/api/pagos/webhook-stripe/", view: "StripeWebhookView", name: "webhook-stripe" },
    ],
    "Autenticación": [
      { path: "/api/login/", view: "LoginView", name: "login" },
      { path: "/api/register/", view: "RegisterView", name: "register" },
      { path: "/api/me/", view: "MeView", name: "me" },
    ],
  };

  return (
    <ProtectedLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Encabezado */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-xl shadow-md">
            <Code2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Documentación API (Swagger)</h1>
            <p className="text-sm text-gray-500">
              Visualiza los endpoints REST disponibles en el backend de SmartSales365.
            </p>
          </div>
        </div>

        {loadingDocs ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 border-b border-gray-200 flex justify-between">
              <span>📘 /api/docs (Swagger UI)</span>
              <span className="text-green-600">Conectado ✓</span>
            </div>

            <div className="p-4 bg-white divide-y divide-gray-100">
              {Object.entries(endpoints).map(([modulo, items]) => (
                <div key={modulo} className="py-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Server className="w-4 h-4 text-blue-600" />
                    <h2 className="text-sm font-semibold text-gray-800">{modulo}</h2>
                  </div>
                  <div className="space-y-1 ml-6">
                    {items.map((ep) => (
                      <div
                        key={ep.path}
                        className="flex items-center gap-2 text-xs md:text-sm text-gray-700 bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-100 px-3 py-2 transition"
                      >
                        <FileCode2 className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                        <code className="text-gray-900 font-mono flex-1">{ep.path}</code>
                        <span className="text-gray-400 text-[11px] hidden md:inline">
                          {ep.view}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
}
