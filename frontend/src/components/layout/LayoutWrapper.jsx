"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Sidebar } from "./Sidebar";

export function LayoutWrapper({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen">
      {/* Sidebar desktop - siempre visible */}
      <div className="hidden sm:block w-20 bg-primary p-4 shrink-0">
        <Sidebar />
      </div>

      {/* Sidebar mobile - overlay */}
      <div
        className={`fixed inset-0 z-40 sm:hidden transition-all duration-200 ${
          sidebarOpen ? "visible" : "invisible"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${
            sidebarOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setSidebarOpen(false)}
        />
        <div
          className={`absolute left-0 top-0 h-full w-56 bg-primary px-3 py-4 transition-transform duration-200 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between mb-5 px-1">
            <span className="text-sm font-semibold text-[#2B2B2B]">Menú</span>
            <button
              className="flex items-center justify-center w-8 h-8 rounded-xl text-[#2B2B2B] hover:bg-white/15 transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <Sidebar showLabel />
        </div>
      </div>

      {/* Franja mobile con botón hamburguesa */}
      <div className="sm:hidden w-12 bg-primary flex flex-col items-center pt-4 shrink-0">
        <button
          className="flex items-center justify-center w-9 h-9 rounded-xl text-[#2B2B2B] hover:bg-white/15 transition-colors"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 py-4 bg-primary min-w-0">
        <div className="bg-background rounded-tl-4xl rounded-bl-4xl h-full overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
