import type { ProductoCatalogo } from "../types/catalogo";

export function getProductoImageUrl(producto: ProductoCatalogo): string {
  const anyProd = producto as any;

  // 1) Usamos la URL completa que manda el backend
  if (anyProd.imagen_url) {
    return anyProd.imagen_url as string;
  }

  // 2) Fallback por si algún día solo llega imagen_key ya como URL
  if (anyProd.imagen_key) {
    return anyProd.imagen_key as string;
  }

  return "/placeholder-product.png";
}
