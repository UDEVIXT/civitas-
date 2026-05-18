"use client";

import { NuevaContrasena } from "@/features/auth/components/NewContraForm";
import apiClient from "@/api/axios";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Suspense } from "react";
import { AxiosError } from "axios";

function NuevaContrasenaContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    
    // ✅ CORRECCIÓN: Extraemos los datos que el paso anterior inyectó en la URL
    const email = searchParams.get("email"); 
    const codigoValido = searchParams.get("codigo"); 

    async function handleResetPassword(data: { password: string }) {
        try {
            // 🚀 CORRECCIÓN: Enviamos solo lo que ResetPasswordDto espera recibir
            await apiClient.post("/auth/reset-password", {
                codigo: codigoValido,
                nuevaPassword: data.password,
            });
            
            toast.success("Contraseña actualizada con éxito. Ya puedes iniciar sesión.");
            router.push("/login"); 
        } catch (error: unknown) {
            const axiosError = error as AxiosError<{ message?: string | string[] }>;
            
            const respuestaBackend = axiosError.response?.data?.message;
            const mensajeError = Array.isArray(respuestaBackend) 
                ? respuestaBackend.join(" | ") 
                : respuestaBackend || "Ocurrió un error al intentar cambiar la contraseña.";

            toast.error(mensajeError);
            throw error; 
        }
    }

    // Validación preventiva por si entran a la ruta directamente sin pasar por el flujo
    if (!email || !codigoValido) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <p className="text-muted-foreground">Faltan credenciales de verificación en la URL.</p>
                <button 
                    onClick={() => router.push("/recuperar-contrasena")}
                    className="bg-amber-400 text-white px-4 py-2 rounded-md font-semibold"
                >
                    Volver al inicio
                </button>
            </div>
        );
    }

    return <NuevaContrasena onSubmit={handleResetPassword} />;
}

export default function NuevaContrasenaPage() {
    return (
        <Suspense fallback={<div className="text-center py-20 text-muted-foreground">Cargando...</div>}>
            <NuevaContrasenaContent />
        </Suspense>
    );
}