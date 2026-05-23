import { useAuth } from "@/features/auth/hooks/useAuth"
import {
  getRoutesByRole,
  canAccessRoute,
} from "@/config/routes.config"
import { type RoleType } from "@/types/roles"

export function useRoutes() {
  const { user } = useAuth()
  const userRole = user?.rol as RoleType | undefined
  const allowedRoutes = getRoutesByRole(userRole)
  const canAccess = (path: string): boolean => {
    return canAccessRoute(userRole, path)
  }

  return {
    allowedRoutes,
    canAccess,
    userRole,
  }
}
