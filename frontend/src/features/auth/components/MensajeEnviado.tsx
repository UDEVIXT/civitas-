"use client";

import { Mail } from "lucide-react";

interface CorreoEnviadoProps {
    email?: string;
    onReenviar?: () => void;
}

export function MensajeEnviado({
    email = "usuario_ejemplo@dominio.com",
    onReenviar,
}: CorreoEnviadoProps) {
    return (
        <div className="flex-1 flex items-center justify-center px-4 py-8 h-full">
            <div className="w-full max-w-sm space-y-6 text-center">

                {/* Ícono de sobre */}
                <div className="flex justify-center">
                    <div className="relative w-24 h-24">
                        <svg
                            viewBox="0 0 96 96"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-full h-full"
                        >
                            {/* Sobre abierto */}
                            <path
                                d="M12 36L48 58L84 36"
                                stroke="#F59E0B"
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M12 30C12 27.8 13.8 26 16 26H80C82.2 26 84 27.8 84 30V74C84 76.2 82.2 78 80 78H16C13.8 78 12 76.2 12 74V30Z"
                                stroke="#F59E0B"
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            {/* Solapa superior izquierda */}
                            <path
                                d="M12 26L36 48"
                                stroke="#F59E0B"
                                strokeWidth="3.5"
                                strokeLinecap="round"
                            />
                            {/* Solapa superior derecha */}
                            <path
                                d="M84 26L60 48"
                                stroke="#F59E0B"
                                strokeWidth="3.5"
                                strokeLinecap="round"
                            />
                            {/* Check badge */}
                            <circle cx="68" cy="28" r="13" fill="white" />
                            <circle cx="68" cy="28" r="11" fill="#F59E0B" />
                            <path
                                d="M63 28L66.5 31.5L73 25"
                                stroke="white"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                </div>

                {/* Título */}
                <div className="space-y-3">
                    <h1 className="text-2xl font-bold text-foreground">¡Correo enviado!</h1>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Te hemos enviando un correo electrónico con instrucciones para
                        restablecer tu contraseña a
                    </p>

                    {/* Email destacado */}
                    <div className="inline-block border border-border rounded-md px-4 py-1.5 text-sm text-foreground font-medium">
                        {email}
                    </div>
                </div>

                {/* Mensaje de spam */}
                <div className="space-y-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Porfavor, revisa tu carpeta de entrada, incluyendo tu carpeta de spam
                    </p>

                    {/* Reenviar */}
                    <button
                        onClick={onReenviar}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline cursor-pointer"
                    >
                        ¿No lo recibiste? Volver a enviar
                    </button>
                </div>

                {/* Volver al login */}
                <div className="pt-2 text-sm text-muted-foreground">
                    Volver a{" "}
                    <a
                        href="/login"
                        className="text-amber-500 hover:text-amber-600 font-medium hover:underline transition-colors cursor-pointer"
                    >
                        Inicio de sesión
                    </a>
                </div>
            </div>
        </div>
    );
}