import { useState, useEffect, useCallback } from "react";
import { obtenerAccesosPreautorizados, AccesoPreautorizado } from "../api/accesos";

export function useAccesosPreautorizados() {
  const [accesos, setAccesos] = useState<AccesoPreautorizado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccesos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await obtenerAccesosPreautorizados();
      setAccesos(data);
    } catch {
      setError("No se pudieron cargar los accesos preautorizados. Intenta de nuevo.");
      setAccesos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccesos();
  }, [fetchAccesos]);

  return { accesos, loading, error, refetch: fetchAccesos };
}
