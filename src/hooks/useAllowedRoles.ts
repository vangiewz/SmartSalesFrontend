import { useEffect, useState } from "react";
import { getMyRoles } from "../services/api";

/**
 * Permite el acceso si el usuario tiene al menos UNO de los roles indicados.
 * Uso desde tu página:
 *   const { isAllowed, loading: rolesLoading } = useAllowedRoles(["admin", "vendedor", "analista"]);
 *
 * Este hook:
 * - Normaliza nombres (mayúsculas/minúsculas/acentos).
 * - Soporta sinónimos comunes (administrador/admin, vendedor/seller/ventas, analista/analyst).
 * - Considera también los flags del backend (is_admin, is_vendedor, is_analista).
 */
export function useAllowedRoles(allowedRoles: string[]) {
  const [isAllowed, setIsAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  const normalize = (s: string) =>
    String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); // quita acentos

  // Sinónimos por si el backend usa nombres distintos
  const SYNONYMS: Record<string, string[]> = {
    admin: ["admin", "administrator", "administrador", "superadmin", "super administrador"],
    vendedor: ["vendedor", "seller", "ventas", "sales"],
    analista: ["analista", "analyst"],
  };

  // Expande la lista de roles permitidos con sus sinónimos
  const expandedAllowed = Array.from(
    new Set(
      allowedRoles
        .map(normalize)
        .flatMap((r) => SYNONYMS[r] ? SYNONYMS[r] : [r])
        .map(normalize)
    )
  );

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      try {
        const data = await getMyRoles();
        const rolesArr: string[] = Array.isArray((data as any)?.roles) ? (data as any).roles : [];
        const userRolesNorm = rolesArr.map(normalize);

        // Flags del backend (si existen)
        const flagsAllowed =
          Boolean((data as any)?.is_admin) ||
          Boolean((data as any)?.is_vendedor) ||
          Boolean((data as any)?.is_analista);

        // Coincidencia por nombre (con sinónimos)
        const namesAllowed = userRolesNorm.some((r) => expandedAllowed.includes(r));

        const ok = flagsAllowed || namesAllowed;

        if (!cancelled) {
          setIsAllowed(ok);
          // Debug útil si te queda la pantalla en blanco
          if (!ok) {
            // eslint-disable-next-line no-console
            console.warn(
              "[useAllowedRoles] Acceso denegado. Roles del usuario:",
              rolesArr,
              "Flags:",
              {
                is_admin: (data as any)?.is_admin,
                is_vendedor: (data as any)?.is_vendedor,
                is_analista: (data as any)?.is_analista,
              },
              "Allowed (expandido):",
              expandedAllowed
            );
          }
        }
      } catch (err) {
        if (!cancelled) {
          setIsAllowed(false);
          // eslint-disable-next-line no-console
          console.error("[useAllowedRoles] Error consultando rolesusuario/me/:", err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
    // stringify para evitar rerenders por referencia del array
  }, [JSON.stringify(expandedAllowed)]);

  return { isAllowed, loading };
}