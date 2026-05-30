"use client";

import { useSearchParams } from "next/navigation";
import { UploadINE } from "@/features/auth/components/SubirCredencialINE";

export function UploadINEPageContent() {
  const searchParams = useSearchParams();
  const tipo = searchParams.get("tipo") || "Residente";

  const rolMap: Record<string, string> = {
    residente: "Residente",
    administrador: "Administrador",
    guardia: "Guardia",
  };

  const rol = rolMap[tipo.toLowerCase()] || "Residente";

  return <UploadINE rol={rol} />;
}
