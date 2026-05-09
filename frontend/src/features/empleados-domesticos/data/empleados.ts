import empleados from "./empleados.json";

import type { EmpleadoDomestico } from "../types";

const empleadosDomesticos = empleados as EmpleadoDomestico[];

export async function getEmpleadosDomesticos(): Promise<EmpleadoDomestico[]> {
  return empleadosDomesticos;
}
