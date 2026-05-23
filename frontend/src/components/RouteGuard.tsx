"use client"

import { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { canAccessRoute, type RoleType } from "@/config/routes.config"
import { ROLES } from "@/types/roles"

interface RouteGuardProps {
  children: ReactNode
  requiredRoles?: RoleType[]
  currentPath?: string
}

export function RouteGuard({ children, requiredRoles, currentPath }: RouteGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  // Si no está autenticado, redirigir a login
  if (!user) {
    router.push("/login")
    return null
  }

  // Si se proporcionan roles específicos requeridos, verificar si el usuario tiene alguno de ellos
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.includes(user.rol as RoleType)
    if (!hasRequiredRole) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Acceso Denegado</h1>
            <p className="text-muted-foreground mb-4">
              No tienes permisos para acceder a esta sección.
            </p>
            <button
              onClick={() => router.push("/")}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Volver al Panel Principal
            </button>
          </div>
        </div>
      )
    }
  }

  // Si se proporciona la ruta actual, verificar contra la configuración de rutas
  if (currentPath && !canAccessRoute(user.rol as RoleType, currentPath)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Acceso Denegado</h1>
          <p className="text-muted-foreground mb-4">
            Tu rol ({user.rol}) no tiene acceso a esta sección.
          </p>
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Volver al Panel Principal
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
