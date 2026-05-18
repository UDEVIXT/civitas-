"use client";

import { MensajeEnviado } from "@/features/auth/components/MensajeEnviado";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

function CorreoEnviadoContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const email = searchParams.get("email") || "";

    return (
        <MensajeEnviado 
            email={email} 
            onContinuar={() => router.push(`/recuperar-contrasena/verificar?email=${encodeURIComponent(email)}`)}
        />
    );
}

export default function CorreoEnviadoPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <CorreoEnviadoContent />
        </Suspense>
    );
}