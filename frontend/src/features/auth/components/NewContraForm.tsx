"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { EyeIcon, EyeOffIcon } from "lucide-react";

interface NuevaContrasenaProps {
    onSubmit?: (data: { password: string }) => Promise<void>;
}

export function NuevaContrasena({ onSubmit }: NuevaContrasenaProps) {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const newErrors: Record<string, string> = {};

        if (!password.trim()) {
            newErrors.password = "Debe introducir una contraseña";
        } else if (!passwordRegex.test(password)) {
            newErrors.password = "Mínimo 8 caracteres, mayúsculas y números";
        }

        if (!confirmPassword.trim()) {
            newErrors.confirmPassword = "Debe confirmar su contraseña";
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = "Las contraseñas no coinciden";
        }

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        setIsLoading(true);
        try {
            await onSubmit?.({ password });
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex-1 flex items-center justify-center px-4 py-8 h-full">
            <div className="w-full max-w-sm space-y-8">

                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold text-foreground">
                        Crea tu nueva contraseña
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Ingresa una contraseña segura y fácil de recordar.
                    </p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>

                    {/* Nueva contraseña */}
                    <div className="space-y-1">
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Nueva contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pr-10"
                                aria-invalid={errors.password ? "true" : undefined}
                                aria-describedby={errors.password ? "password-error" : undefined}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                            </button>
                        </div>
                        {errors.password && (
                            <p id="password-error" className="text-xs text-destructive">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    {/* Confirmar contraseña */}
                    <div className="space-y-1">
                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                type={showConfirm ? "text" : "password"}
                                placeholder="Confirmar contraseña"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="pr-10"
                                aria-invalid={errors.confirmPassword ? "true" : undefined}
                                aria-describedby={errors.confirmPassword ? "confirm-error" : undefined}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                tabIndex={-1}
                            >
                                {showConfirm ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p id="confirm-error" className="text-xs text-destructive">
                                {errors.confirmPassword}
                            </p>
                        )}
                    </div>

                    <p className="text-xs text-muted-foreground text-center">
                        Mínimo 8 caracteres, mayúsculas y números
                    </p>

                    <Button
                        type="submit"
                        className="w-full bg-amber-400 hover:bg-amber-500 text-white font-semibold"
                        size="lg"
                        disabled={isLoading}
                    >
                        {isLoading ? <Spinner /> : "Actualizar contraseña"}
                    </Button>

                    <div className="text-center text-sm text-muted-foreground pt-1">
                        Volver a{" "}
                        <a href="/login" className="text-amber-500 hover:text-amber-600 font-medium hover:underline transition-colors">
                            Inicio de sesión
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}