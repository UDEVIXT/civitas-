"use client";

import { NuevaContrasena } from "@/features/auth/components/NewContraForm";
import apiClient from "@/api/axios";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Suspense } from "react";

function NuevaContrasenaContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token"); // Extraemos el token de la URL

    async function handleResetPassword(data: { password: string }) {
        if (!token) {
            toast.error("Token de recuperación no válido o faltante. Por favor, usa el enlace de tu correo.");
            throw new Error("No token"); // Detenemos la ejecución
        }

        try {
            // Ajusta este endpoint según lo que hayas definido en tu NestJS
            await apiClient.post("/auth/restablecer-contrasena", {
                token,
                nuevaContrasena: data.password,
            });
            
            toast.success("Contraseña actualizada con éxito. Ya puedes iniciar sesión.");
            router.push("/login"); // Mandamos al usuario al login
        } catch (error) {
            // Tu componente NewContraForm capturará este error y quitará el modo 'cargando'
            throw error; 
        }
    }

    return <NuevaContrasena onSubmit={handleResetPassword} />;
}

export default function NuevaContrasenaPage() {
    return (
        <Suspense fallback={<div className="flex justify-center py-20 text-muted-foreground">Cargando...</div>}>
            <NuevaContrasenaContent />
        </Suspense>
    );
}