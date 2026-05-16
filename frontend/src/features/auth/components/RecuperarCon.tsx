"use client";

// Componentes
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import apiClient from "@/api/axios";
import { useRouter } from "next/navigation";

export function RecuperarContrasena() {
    const [usuario, setUsuario] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        const newErrors: Record<string, string> = {};
        if (!usuario.trim()) {
            newErrors.user = "Debe introducir un correo válido";
        } else if (!/^\S+@\S+\.\S+$/.test(usuario.trim())) {
            newErrors.user = "Debe introducir un correo válido";
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) return;

        setIsLoading(true);
        try {
            await apiClient.post("/auth/recuperar-contrasena", { 
                email: usuario 
            });
            toast.success("Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña.");
            // Redirigir a la pantalla de correo enviado
            router.push("/recuperar-contrasena/correoenviado");
        } catch (error: unknown) {
            console.error(error);

            const axiosError = error as {
                response?: { status?: number; data?: { message?: string } };
            };
            if (axiosError.response?.status === 404) {
                toast.error(
                    axiosError.response.data?.message || "No se encontró el usuario",
                );
            } else {
                toast.error("Error al solicitar la recuperación de contraseña");
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex-1 flex items-center justify-center px-4 py-8 h-full">
            <div className="w-full max-w-md space-y-8">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold">¿Olvidaste tu contraseña?</h1>
                    <p className="text-muted-foreground">
                        No te preocupes, ingresa tu correo y te enviaremos las instrucciones para restablecer tu contraseña.
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <Label htmlFor="email">Correo electrónico</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Ingresa tu correo"
                            value={usuario}
                            onChange={(e) => setUsuario(e.target.value)}
                            aria-invalid={errors.user ? "true" : undefined}
                            aria-describedby={errors.user ? "user-error" : undefined}
                        />
                        {errors.user && (
                            <p id="user-error" className="text-sm text-destructive">
                                {errors.user}
                            </p>
                        )}
                    </div>

                    
                    <Button
                        type="submit"
                        className="w-full cursor-pointer"
                        size="lg"
                        disabled={isLoading}
                    >
                        {isLoading ? <Spinner /> : "Reestablecer"}
                    </Button>

                    <div className="text-center text-sm">
                        <p className="text-muted-foreground">
                            Volver a{" "}
                            <a href="/login" className="text-primary hover:underline font-medium">
                                Inicio de sesión
                            </a>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
