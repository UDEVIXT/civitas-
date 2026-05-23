import React, { ReactNode } from "react"
import { RouteGuard } from "@/components/RouteGuard"
import { ROLES } from "@/types/roles"
import { useRoutes } from "@/hooks/useRoutes"

export function BitacoraGuardiaLayoutExample({ children }: { children: ReactNode }) {
  return (
    <RouteGuard requiredRoles={[ROLES.GUARDIA]}>
      {children}
    </RouteGuard>
  )
}

export function BitacoraAdministradorLayoutExample({ children }: { children: ReactNode }) {
  return (
    <RouteGuard requiredRoles={[ROLES.ADMINISTRADOR]}>
      {children}
    </RouteGuard>
  )
}

export function EmpleadosDomesticosLayoutExample({ children }: { children: ReactNode }) {
  return (
    <RouteGuard requiredRoles={[ROLES.GUARDIA, ROLES.ADMINISTRADOR]}>
      {children}
    </RouteGuard>
  )
}

export function ComponenteConAutorizacion() {
  const { canAccess, allowedRoutes } = useRoutes()

  return (
    <div>
      <h1>Mis Acciones Disponibles</h1>
      <ul>
        {allowedRoutes.map((route) => (
          <li key={route.path}>
            <a href={route.path}>{route.label}</a>
          </li>
        ))}
      </ul>

      {canAccess("/bitacora/guardia") && (
        <button onClick={() => window.location.href = "/bitacora/guardia"}>
          Ir a Bitácora de Guardia
        </button>
      )}
    </div>
  )
}