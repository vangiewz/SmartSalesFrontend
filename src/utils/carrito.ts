// src/utils/carrito.ts

const CARRITO_KEY = 'smartsales_carrito';
const CARRITO_PRODUCTOS_KEY = 'smartsales_carrito_productos'; // 🆕 Cache de productos completos

interface Carrito {
  [producto_id: string]: number; // cantidad
}

/**
 * Obtiene el carrito desde localStorage
 */
export const getCarrito = (): Carrito => {
  try {
    const carrito = localStorage.getItem(CARRITO_KEY);
    return carrito ? JSON.parse(carrito) : {};
  } catch (error) {
    console.error('Error al obtener carrito:', error);
    return {};
  }
};

/**
 * Guarda el carrito en localStorage
 */
export const saveCarrito = (carrito: Carrito): void => {
  try {
    localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito));
    // Disparar evento para actualizar contador en navbar
    window.dispatchEvent(new Event('carritoActualizado'));
  } catch (error) {
    console.error('Error al guardar carrito:', error);
  }
};

/**
 * Agrega un producto al carrito
 */
export const agregarAlCarrito = (idProducto: number, cantidad: number = 1): void => {
  const carrito = getCarrito();
  const key = String(idProducto);
  carrito[key] = (carrito[key] || 0) + cantidad;
  saveCarrito(carrito);
};

/**
 * Actualiza la cantidad de un producto
 */
export const actualizarCantidad = (idProducto: number, cantidad: number): void => {
  const carrito = getCarrito();
  const key = String(idProducto);
  
  if (cantidad <= 0) {
    delete carrito[key];
  } else {
    carrito[key] = cantidad;
  }
  
  saveCarrito(carrito);
};

/**
 * Elimina un producto del carrito
 */
export const eliminarDelCarrito = (idProducto: number): void => {
  const carrito = getCarrito();
  const key = String(idProducto);
  delete carrito[key];
  saveCarrito(carrito);
};

/**
 * Limpia el carrito completamente
 */
export const limpiarCarrito = (): void => {
  localStorage.removeItem(CARRITO_KEY);
  window.dispatchEvent(new Event('carritoActualizado'));
};

/**
 * Obtiene la cantidad total de items en el carrito
 */
export const getCantidadTotal = (): number => {
  const carrito = getCarrito();
  return Object.values(carrito).reduce((total, cant) => total + cant, 0);
};

/**
 * Convierte el carrito a formato para el checkout
 */
export const carritoToCheckoutItems = (carrito: Carrito) => {
  return Object.entries(carrito).map(([producto_id, cantidad]) => ({
    producto_id: parseInt(producto_id),
    cantidad
  }));
};

// 🆕 =============================================
// FUNCIONES PARA CACHE DE PRODUCTOS (PWA OFFLINE)
// =============================================

/**
 * Guarda los datos completos de productos en cache para uso offline
 */
export const saveProductosCache = (productos: any[]) => {
  try {
    const cache: Record<string, any> = {};
    productos.forEach(producto => {
      cache[String(producto.id)] = producto;
    });
    localStorage.setItem(CARRITO_PRODUCTOS_KEY, JSON.stringify(cache));
    console.log('💾 Cache de productos guardado:', Object.keys(cache).length);
  } catch (error) {
    console.error('Error al guardar cache de productos:', error);
  }
};

/**
 * Obtiene productos del cache para uso offline
 */
export const getProductosCache = (): Record<string, any> => {
  try {
    const cache = localStorage.getItem(CARRITO_PRODUCTOS_KEY);
    return cache ? JSON.parse(cache) : {};
  } catch (error) {
    console.error('Error al obtener cache de productos:', error);
    return {};
  }
};

/**
 * Actualiza un solo producto en el cache
 */
export const updateProductoCache = (producto: any) => {
  try {
    const cache = getProductosCache();
    cache[String(producto.id)] = producto;
    localStorage.setItem(CARRITO_PRODUCTOS_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Error al actualizar cache de producto:', error);
  }
};

/**
 * Obtiene productos del carrito desde el cache (para offline)
 */
export const getProductosCarritoFromCache = (): any[] => {
  const carrito = getCarrito();
  const cache = getProductosCache();
  const productIds = Object.keys(carrito);
  
  return productIds
    .map(id => cache[id])
    .filter(producto => producto !== undefined);
};

// NOTA: El carrito NO necesita sincronización con backend
// Solo usa localStorage, por lo que funciona 100% offline
// Las funciones actualizarCantidad y eliminarDelCarrito son suficientes
