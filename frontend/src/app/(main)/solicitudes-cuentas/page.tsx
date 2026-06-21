import { SolicitudesView } from "@/features/solicitudes/components/SolicitudesView";
import { RouteGuard } from "@/components/RouteGuard";
import { ROLES } from "@/types/roles";

export default function SolicitudesCuentasPage() {
  return (
    <RouteGuard requiredRoles={[ROLES.ADMINISTRADOR]} currentPath="/solicitudes-cuentas">
      <SolicitudesView />
    </RouteGuard>
  );
}
