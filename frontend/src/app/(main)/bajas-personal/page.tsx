import { BajasPersonalPage } from "@/features/bajas-personal/components/bajas-personal-page";
import { RouteGuard } from "@/components/RouteGuard";
import { ROLES } from "@/types/roles";

export const metadata = {
  title: "Historial de Bajas de Personal",
  description: "Historial y Comentarios de Bajas de Personal Doméstico.",
};

export default function BajasPersonalRoute() {
  return (
    <RouteGuard requiredRoles={[ROLES.ADMINISTRADOR]} currentPath="/bajas-personal">
      <BajasPersonalPage />
    </RouteGuard>
  );
}
