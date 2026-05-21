import { type LucideIcon } from "lucide-react";

export interface Route {
  path: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

import {
  ClipboardList,
  FileText,
  Users,
  AlertTriangle,
  Clock,
  UserCheck,
  Scan,
} from "lucide-react";

export const routes: Route[] = [
  {
    path: "/bitacora/guardia",
    label: "Bitácora Guardia",
    description: "Registro de accesos de visitantes, empleados y proveedores.",
    icon: ClipboardList,
  },
  {
    path: "/bitacora/administrador",
    label: "Bitácora Administrador",
    description: "Vista administrativa de todos los accesos registrados.",
    icon: FileText,
  },
  {
    path: "/servicios-repartidores/guardia",
    label: "Servicios y Repartidores",
    description: "Escaneo y validación de servicios a domicilio.",
    icon: Scan,
  },
  {
    path: "/empleados-domesticos",
    label: "Empleados Domésticos",
    description: "Gestión de empleados domésticos registrados en el sistema.",
    icon: Users,
  },
  {
    path: "/incidencias",
    label: "Incidencias",
    description: "Reporte y seguimiento de incidencias en la comunidad.",
    icon: AlertTriangle,
  },
  {
    path: "/mi-bitacora-accesos",
    label: "Mi Bitácora de Accesos",
    description: "Consulta tu historial personal de accesos.",
    icon: Clock,
  },
  {
    path: "/mis-empleados",
    label: "Mis Empleados",
    description: "Administra los empleados registrados a tu cargo.",
    icon: UserCheck,
  },
  {
    path: "/mis-visitantes",
    label: "Mis Visitantes",
    description: "Gestiona los visitantes registrados en el sistema.",
    icon: Users,
  },
];
