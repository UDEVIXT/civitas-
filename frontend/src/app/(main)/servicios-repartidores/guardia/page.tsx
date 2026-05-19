import { EscaneoServiciosDashboard } from "@/features/servicios-domicilio/guardia/components/EscaneoServiciosDashboard";
import { RouteGuard } from "@/features/auth/components/RouteGuard";

export default function EscaneoServiciosPage() {
  return (
    <RouteGuard type="protected">
      <EscaneoServiciosDashboard />
    </RouteGuard>
  );
}
