"use client";

import { VerificarCodigo } from "@/features/auth/components/VerificarCodigo"; // Ajusta la ruta si es necesario
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function VerificarCodigoContent() {
    const searchParams = useSearchParams();
    // Extraemos el correo de la URL (ej. ?email=jhornegallegos@outlook.com)
    const email = searchParams.get("email") || "";

    return <VerificarCodigo email={email} />;
}

export default function VerificarCodigoPage() {
    return (
        // El Suspense es obligatorio en Next.js cuando usas useSearchParams en un Client Component
        <Suspense fallback={<div className="flex justify-center py-20 text-muted-foreground">Cargando...</div>}>
            <VerificarCodigoContent />
        </Suspense>
    );
}