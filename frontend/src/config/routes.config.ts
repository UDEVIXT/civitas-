import { ROLES, type RoleType } from "@/types/roles";
import { routes } from "@/features/home/data/routes";

/**
 * Obtiene las rutas permitidas para un rol específico
 */
export function getRoutesByRole(role: RoleType | undefined) {
  if (!role) return [];
  return routes.filter((route) => route.roles.includes(role));
}

/**
 * Verifica si un rol tiene acceso a una ruta
 */
export function canAccessRoute(role: RoleType | undefined, path: string): boolean {
  if (!role) return false;
  return routes.some(
    (route) => route.path === path && route.roles.includes(role)
  );
}
