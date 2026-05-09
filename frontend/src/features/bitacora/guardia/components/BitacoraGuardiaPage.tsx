"use client";

import * as React from "react";
import { TablaAccesosGuardia } from "./TablaAccesosGuardia";
import { FiltrosTabla } from "./FiltrosTabla";

type Filters = {
  search?: string;
  tipo?: string;
  residencia?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  ordenar?: string;
  page?: string;
  limit?: string;
};

export function BitacoraGuardiaPage() {
  const [filters, setFilters] = React.useState<Filters>({
    page: "1",
    limit: "10",
    ordenar: "reciente",
    tipo: "todos",
    residencia: "todas",
    search: "",
  });

  const [data, setData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Debounced fetch when filters change
  React.useEffect(() => {
    const id = setTimeout(() => {
      fetchData();
    }, 300);

    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  async function fetchData() {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.tipo && filters.tipo !== "todos") params.set("tipo", filters.tipo);
      if (filters.residencia && filters.residencia !== "todas") params.set("residencia", filters.residencia);
      if (filters.fecha_inicio) params.set("fecha_inicio", filters.fecha_inicio);
      if (filters.fecha_fin) params.set("fecha_fin", filters.fecha_fin);
      if (filters.ordenar) params.set("ordenar", filters.ordenar);
      if (filters.page) params.set("page", filters.page);
      if (filters.limit) params.set("limit", filters.limit);

      const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
      const apiUrl = `${API_BASE}/bitacora-guardia?${params.toString()}`;

      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

      const res = await fetch(apiUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        credentials: token ? 'include' : undefined,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      // backend returns { success: true, data, meta }
      setData(json.data || []);
    } catch (err: any) {
      setError(err.message || "Error al obtener datos");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold">Bitacora de Accesos</h1>
      <FiltrosTabla filters={filters} onChange={(f) => setFilters((prev) => ({ ...prev, ...f }))} />
      <TablaAccesosGuardia data={data} loading={loading} error={error} />
    </div>
  );
}
