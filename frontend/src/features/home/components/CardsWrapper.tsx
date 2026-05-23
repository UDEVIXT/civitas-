"use client"

import { CardRoute } from "./CardRoute"
import { routes } from "../data/routes"
import { useAuth } from "@/features/auth/hooks/useAuth"

export function CardsWrapper() {
  const { user } = useAuth()
  
  // Filtrar rutas según el rol del usuario
  const allowedRoutes = routes.filter((route) => 
    user?.rol && route.roles.includes(user.rol as any)
  )

  if (allowedRoutes.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">No hay acciones disponibles para tu rol.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {allowedRoutes.map((route) => (
        <CardRoute key={route.path} route={route} />
      ))}
    </div>
  )
}
