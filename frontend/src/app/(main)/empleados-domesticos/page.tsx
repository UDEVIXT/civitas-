import { EmpleadosDomesticosPage } from "@/features/empleados-domesticos/components/empleados-domesticos-page";

export const metadata = {
  title: "Empleados Domésticos",
  description: "Gestión de empleados domésticos registrados en el sistema.",
};

export default async function EmpleadosDomesticos() {
  return <EmpleadosDomesticosPage />;
}
