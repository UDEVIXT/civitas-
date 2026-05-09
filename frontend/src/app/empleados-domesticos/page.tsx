import { EmpleadosDomesticosPage } from "@/features/empleados-domesticos/components/empleados-domesticos-page";
import { getEmpleadosDomesticos } from "@/features/empleados-domesticos/data/empleados";

export default async function EmpleadosDomesticos() {
  const response = await getEmpleadosDomesticos({
    page: 1,
    limit: 7,
  });

  return (
    <EmpleadosDomesticosPage
      initialData={response.data}
      initialMeta={response.meta}
    />
  );
}
