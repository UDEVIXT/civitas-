"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Home, ClipboardCheck, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type UserType = "residente" | "administrador" | "guardia";

const roles = [
    {
        id: "residente" as UserType,
        label: "Residente",
        icon: Home,
        description: "Accede a tu unidad, gestiona tus visitas, reservas de áreas comunes y más.",
    },
    {
        id: "administrador" as UserType,
        label: "Administrador",
        icon: ClipboardCheck,
        description: "Gestiona la zona, supervisa staff, administra pagos y reportes.",
    },
    {
        id: "guardia" as UserType,
        label: "Guardia",
        icon: ShieldCheck,
        description: "Valida accesos en tiempo real, registra eventos y supervisa la seguridad de la zona.",
    },
];

export function SignInTypeUser() {
    const [selected, setSelected] = useState<UserType>("administrador");
    const router = useRouter();

    return (
        <div className="min-h-screen flex items-center justify-center px-16">
            <div className="w-full max-w space-y-20">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-center">Bienvenido a UDEV</h1>
                    <p className="text-muted-foreground text-center">
                        Porfavor ¡selecciona tu tipo de cuenta para comenzar!
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {roles.map(({ id, label, icon: Icon, description }) => (
                        <div
                            key={id}
                            onClick={() => setSelected(id)}
                            className={cn(
                                "flex flex-col items-center gap-4 rounded-xl border p-6 cursor-pointer transition-all",
                                selected === id
                                    ? "border-amber-500 border-2"
                                    : "border-border hover:border-amber-400 cursor-pointer",
                            )}
                        >
                            <Icon size={48} strokeWidth={1.4} className="text-amber-500" />
                            <p className="font-semibold text-sm">{label}</p>
                            <p className="text-muted-foreground text-xs text-center leading-relaxed flex-1">
                                {description}
                            </p>
                            <Button 
                                className="w-full bg-amber-400 hover:bg-amber-500 cursor-pointer text-amber-950 font-semibold"
                                onClick={(e) => {
                                    e.stopPropagation(); // Evitamos que haga conflicto con el onClick del div padre
                                    setSelected(id);
                                    router.push(`/signIn/subircredencial?tipo=${id}`);
                                }}
                            >
                                Registrarme
                            </Button>
                        </div>
                    ))}
                </div>

                <div className="text-center text-sm">
                    <p className="text-muted-foreground">
                        ¿Ya tienes una cuenta?{" "}
                        <a href="/login" className="text-amber-500 hover:underline font-medium">
                            Login
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}