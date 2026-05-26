import { type LucideIcon } from "lucide-react";
import { ROLES, type RoleType } from "@/types/roles";

import {
  ClipboardList,
  FileText,
  Users,
  AlertTriangle,
  Clock,
  UserCheck,
  Scan,
} from "lucide-react";

export interface Route {
  path: string;
  label: string;
  description: string;
  icon: LucideIcon;
  roles: RoleType[];
}

export const routes: Route[] = [
  {
    path: "/bitacora/guardia",
    label: "Bitácora Guardia",
    description: "Registro de accesos de visitantes, empleados y proveedores.",
    icon: ClipboardList,
    roles: [ROLES.GUARDIA],
  },
  {
    path: "/bitacora/administrador",
    label: "Bitácora Administrador",
    description: "Vista administrativa de todos los accesos registrados.",
    icon: FileText,
    roles: [ROLES.ADMINISTRADOR],
  },
  {
    path: "/servicios-repartidores/guardia",
    label: "Servicios y Repartidores",
    description: "Escaneo y validación de servicios a domicilio.",
    icon: Scan,
    roles: [ROLES.GUARDIA],
  },
  {
    path: "/empleados-domesticos",
    label: "Empleados Domésticos",
    description: "Gestión de empleados domésticos registrados en el sistema.",
    icon: Users,
    roles: [ROLES.ADMINISTRADOR],
  },
  {
    path: "/incidencias/residente",
    label: "Incidencias",
    description: "Reporte y seguimiento de incidencias en la comunidad.",
    icon: AlertTriangle,
    roles: [ROLES.RESIDENTE],
  },
  {
    path: "/incidencias/admin",
    label: "Incidencias",
    description: "Gestión y seguimiento de incidencias reportadas.",
    icon: AlertTriangle,
    roles: [ROLES.ADMINISTRADOR],
  },
  {
    path: "/mi-bitacora-accesos",
    label: "Mi Bitácora de Accesos",
    description: "Consulta tu historial personal de accesos.",
    icon: Clock,
    roles: [ROLES.RESIDENTE],
  },
  {
    path: "/mis-empleados",
    label: "Mis Empleados",
    description: "Administra los empleados registrados a tu cargo.",
    icon: UserCheck,
    roles: [ROLES.RESIDENTE],
  },
  {
    path: "/mis-visitantes",
    label: "Mis Visitantes",
    description: "Gestiona los visitantes registrados en civitas.",
    icon: Users,
    roles: [ROLES.RESIDENTE],
  },
];
