"use client"

import { CardsWrapper } from "@/features/home/components/CardsWrapper";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function MainPage() {
  const { logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Panel Principal</h1>
        {isAuthenticated && (
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            Cerrar sesión
          </button>
        )}
      </div>
      <CardsWrapper />
    </div>
  );
}
