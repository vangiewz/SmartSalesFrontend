import { getProductoImageUrl } from "../../utils/getProductoImageUrl";
import { useState, useEffect } from "react";
import ProtectedLayout from "../../components/ProtectedLayout";
import { ShoppingCart, Plus, Minus, Trash2, Package, ArrowRight, Home } from "lucide-react";
import { getCarrito, actualizarCantidad, eliminarDelCarrito, limpiarCarrito } from "../../utils/carrito";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../../lib/client";
import type { ProductoCatalogo } from "../../types/catalogo";

export default function CarritoPage() {
  const [carrito, setCarrito] = useState<Record<number, number>>({});
  const [productos, setProductos] = useState<ProductoCatalogo[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProductos = async () => {
    try {
      setLoading(true);
      const carritoData = getCarrito();
      setCarrito(carritoData);

      const productIds = Object.keys(carritoData).map(Number);
      if (productIds.length === 0) {
        setProductos([]);
        setLoading(false);
        return;
      }

      const idsParam = productIds.join(",");
      const response = await api.get<ProductoCatalogo[]>("carrito-voz/productos-carrito/", {
        params: { ids: idsParam },
      });

      console.log("🛒 [Carrito] Productos recibidos del backend:", response.data);
      if (response.data[0]) {
        console.log("🛒 [Carrito] Primer producto:", {
          id: (response.data[0] as any).id,
          imagen_url: (response.data[0] as any).imagen_url,
          imagen_key: (response.data[0] as any).imagen_key,
        });
      }

      setProductos(response.data);
    } catch (error) {
      console.error("❌ Error al cargar productos del carrito:", error);
      toast.error("Error al cargar el carrito");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();

    const handleUpdate = () => {
      fetchProductos();
    };

    window.addEventListener("carritoActualizado", handleUpdate);
    return () => {
      window.removeEventListener("carritoActualizado", handleUpdate);
    };
  }, []);

  // 👇 Log de depuración cada vez que cambia la lista de productos
  useEffect(() => {
    if (!loading && productos.length > 0) {
      console.groupCollapsed("🧩 DEBUG Carrito - Productos cargados");
      productos.forEach((p, i) => {
        console.log(`📦 Producto #${i + 1}:`, {
          id: p.id,
          nombre: p.nombre,
          imagen_url: (p as any).imagen_url,
          imagen_key: (p as any).imagen_key,
          url_final: getProductoImageUrl(p),
        });
      });
      console.groupEnd();
    }
  }, [productos, loading]);

  const handleUpdateCantidad = (id: number, newCantidad: number) => {
    const producto = productos.find((p) => p.id === id);
    if (!producto) return;

    if (newCantidad < 1) {
      handleEliminar(id);
      return;
    }

    if (newCantidad > producto.stock) {
      toast.error(`Solo hay ${producto.stock} unidades disponibles`, { icon: "⚠️" });
      return;
    }

    actualizarCantidad(id, newCantidad);
    setCarrito((prev) => ({ ...prev, [id]: newCantidad }));
  };

  const handleEliminar = (id: number) => {
    eliminarDelCarrito(id);
    setCarrito((prev) => {
      const newCarrito = { ...prev };
      delete newCarrito[id];
      return newCarrito;
    });
    toast.success("Producto eliminado del carrito", {
      icon: "🗑️",
      style: {
        borderRadius: "12px",
        background: "#9333ea",
        color: "#fff",
      },
    });
  };

  const handleLimpiar = () => {
    toast(
      (t) => (
        <div className="flex flex-col gap-4 min-w-[280px]">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 bg-red-100 p-2.5 rounded-xl">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900 text-base mb-1">¿Vaciar el carrito?</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Se eliminarán{" "}
                <span className="font-semibold text-gray-900">{productos.length} producto(s)</span>
              </p>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2 border-t border-gray-200">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                limpiarCarrito();
                setCarrito({});
                setProductos([]);
                toast.dismiss(t.id);
                toast.success("Carrito vaciado exitosamente", {
                  icon: "✅",
                  duration: 3000,
                  style: {
                    borderRadius: "12px",
                    background: "#10b981",
                    color: "#fff",
                    fontWeight: "bold",
                  },
                });
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 hover:shadow-lg transition-all text-sm"
            >
              Sí, vaciar
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        style: {
          background: "white",
          color: "#1f2937",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
          borderRadius: "16px",
          padding: "20px",
          minWidth: "320px",
          maxWidth: "450px",
        },
      }
    );
  };

  const calcularTotal = () => {
    return productos.reduce((total, producto) => {
      const cantidad = carrito[producto.id] || 0;
      return total + producto.precio * cantidad;
    }, 0);
  };

  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "USD",
    }).format(precio);
  };

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando carrito...</p>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  if (productos.length === 0) {
    return (
      <ProtectedLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Tu carrito está vacío</h3>
            <p className="text-gray-500 mb-6">Agrega productos desde el catálogo</p>
            <button
              onClick={() => navigate("/inicio")}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              <Home className="h-5 w-5" />
              Ir al Catálogo
            </button>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  const total = calcularTotal();

  return (
    <ProtectedLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-3 rounded-2xl shadow-lg">
              <ShoppingCart className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Mi Carrito
              </h1>
              <p className="text-gray-600 mt-1">{productos.length} producto(s)</p>
            </div>
          </div>

          <button
            onClick={handleLimpiar}
            className="flex items-center gap-2 bg-red-100 text-red-600 px-6 py-3 rounded-xl font-semibold hover:bg-red-200 transition-all duration-200"
          >
            <Trash2 className="h-5 w-5" />
            Vaciar Carrito
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Lista de productos */}
          <div className="lg:col-span-2 space-y-4">
            {productos.map((producto) => {
              const cantidad = carrito[producto.id] || 0;
              const subtotal = producto.precio * cantidad;
              const isAgotado = producto.stock <= 0;

              return (
                <div
                  key={producto.id}
                  className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-200"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Imagen */}
                    <div className="relative w-full sm:w-24 h-32 sm:h-24 flex-shrink-0 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl overflow-hidden mx-auto sm:mx-0">
                      <img
                        src={getProductoImageUrl(producto)}
                        alt={producto.nombre}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          console.warn(
                            `⚠️ Imagen rota para ID ${producto.id}:`,
                            getProductoImageUrl(producto)
                          );
                          (e.target as HTMLImageElement).src = "/placeholder-product.png";
                        }}
                      />

                      {isAgotado && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">Agotado</span>
                        </div>
                      )}
                    </div>

                    {/* Detalles */}
                    <div className="flex-1 min-w-0 text-center sm:text-left">
                      <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-1">
                        {producto.nombre}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-2">
                        {producto.marca.nombre} • {producto.tipoproducto.nombre}
                      </p>
                      <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
                        <Package className="h-4 w-4 text-purple-600" />
                        <span className="text-sm text-gray-600">Stock: {producto.stock}</span>
                      </div>

                      <p className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {formatearPrecio(producto.precio)}
                      </p>
                    </div>

                    {/* Controles */}
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-between w-full sm:w-auto">
                      <button
                        onClick={() => handleEliminar(producto.id)}
                        className="text-red-600 hover:bg-red-100 p-2 rounded-lg transition-all duration-200 order-2 sm:order-1"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>

                      <div className="flex items-center gap-2 order-1 sm:order-2">
                        <button
                          onClick={() => handleUpdateCantidad(producto.id, cantidad - 1)}
                          className="bg-purple-100 text-purple-600 p-2 rounded-lg hover:bg-purple-200 transition-all duration-200"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="text-base sm:text-lg font-semibold text-gray-900 w-10 sm:w-12 text-center">
                          {cantidad}
                        </span>
                        <button
                          onClick={() => handleUpdateCantidad(producto.id, cantidad + 1)}
                          disabled={cantidad >= producto.stock}
                          className="bg-purple-100 text-purple-600 p-2 rounded-lg hover:bg-purple-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <p className="text-base sm:text-lg font-bold text-gray-900 order-3">
                        {formatearPrecio(subtotal)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Resumen del pedido */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-6 sticky top-8 border-2 border-purple-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Resumen del Pedido</h2>

              <div className="space-y-3 mb-6">
                {productos.map((producto) => {
                  const cantidad = carrito[producto.id] || 0;
                  const subtotal = producto.precio * cantidad;
                  return (
                    <div key={producto.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {producto.nombre.substring(0, 20)}... x{cantidad}
                      </span>
                      <span className="font-semibold text-gray-900">
                        {formatearPrecio(subtotal)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t-2 border-purple-300 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total:</span>
                  <span className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {formatearPrecio(total)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
              >
                Proceder al Pago
                <ArrowRight className="h-5 w-5" />
              </button>

              <button
                onClick={() => navigate("/inicio")}
                className="w-full flex items-center justify-center gap-2 bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold border-2 border-purple-200 hover:bg-purple-50 transition-all duration-200 mt-3"
              >
                <Home className="h-5 w-5" />
                Seguir Comprando
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
