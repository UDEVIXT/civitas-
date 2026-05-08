import { EmpleadosDomesticosPage } from "@/features/empleados-domesticos/components/empleados-domesticos-page";
import { getEmpleadosDomesticos } from "@/features/empleados-domesticos/data/empleados";

export default async function EmpleadosDomesticos() {
  const empleados = await getEmpleadosDomesticos();

  return <EmpleadosDomesticosPage empleados={empleados} />;
}
