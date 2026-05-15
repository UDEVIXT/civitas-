"use client"

import { CardRoute } from "./CardRoute"
import { routes } from "../data/routes"

export function CardsWrapper() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {routes.map((route) => (
        <CardRoute key={route.path} route={route} />
      ))}
    </div>
  )
}
