"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import apiClient from "@/api/axios";
import { useRouter } from "next/navigation";

export function VerificarCodigo({ email }: { email: string }) {
    const [codigo, setCodigo] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        
        if (codigo.length !== 6) {
            toast.error("El código debe tener exactamente 6 dígitos");
            return;
        }

        setIsLoading(true);
        try {
            // CA004: Verificamos el código en el backend
            await apiClient.post("/auth/verify-code", { 
                identificador: email, 
                codigo: codigo 
            });
            
            toast.success("Código verificado correctamente");
            console.log("¡Código válido! Navegando a la pantalla final..."+email+" - "+codigo);
            // Si es válido, lo mandamos a crear la nueva contraseña, pasando el correo y el código en la URL
            router.push(`/recuperar-contrasena/nuevacontrasena?email=${encodeURIComponent(email)}&codigo=${codigo}`);
        } catch (error: any) {
            // Extraemos el mensaje real del backend, si no existe, usamos uno por defecto
            const mensajeReal = error.response?.data?.message || "Ocurrió un error al verificar.";
            toast.error(mensajeReal);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex-1 flex items-center justify-center px-4 py-8 h-full">
            <div className="w-full max-w-sm space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold text-foreground">Ingresa tu código</h1>
                    <p className="text-sm text-muted-foreground">
                        Escribe el código de 6 dígitos que enviamos a <strong>{email}</strong>
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <Input
                        type="text"
                        placeholder="000000"
                        value={codigo}
                        onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="text-center tracking-widest font-mono text-3xl h-14"
                    />
                    <Button type="submit" className="w-full bg-amber-400 hover:bg-amber-500" size="lg" disabled={isLoading} cursor-pointer>
                        {isLoading ? <Spinner /> : "Verificar código"}
                    </Button>
                </form>
            </div>
        </div>
    );
}