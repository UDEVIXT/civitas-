"use client";

interface CorreoEnviadoProps {
    email?: string;
    onReenviar?: () => void;
    onContinuar?: () => void; // <-- Añadimos este prop
}

export function MensajeEnviado({
    email = "usuario_ejemplo@dominio.com",
    onReenviar,
    onContinuar,
}: CorreoEnviadoProps) {
    return (
        <div className="flex-1 flex items-center justify-center px-4 py-8 h-full">
            <div className="w-full max-w-sm space-y-6 text-center">
                {/* ... (Mantén tu SVG del sobre amarillo exactamente igual aquí) ... */}
                
                <div className="space-y-3">
                    <h1 className="text-2xl font-bold text-foreground">¡Correo enviado!</h1>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Te hemos enviando un correo electrónico con instrucciones para restablecer tu contraseña a
                    </p>
                    <div className="inline-block border border-border rounded-md px-4 py-1.5 text-sm text-foreground font-medium">
                        {email}
                    </div>
                </div>

                <div className="space-y-3 pt-4">
                    {/* BOTÓN PARA IR A LA NUEVA VISTA */}
                    <button
                        onClick={onContinuar}
                        className="w-full bg-amber-400 hover:bg-amber-500 text-white font-semibold py-2.5 rounded-md transition-colors cursor-pointer"
                    >
                        Ingresar código
                    </button>

                    <p className="text-sm text-muted-foreground leading-relaxed pt-2">
                        Por favor, revisa tu carpeta de entrada, incluyendo tu carpeta de spam
                    </p>
                    <button
                        onClick={onReenviar}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline cursor-pointer"
                    >
                        ¿No lo recibiste? Volver a enviar
                    </button>
                </div>
            </div>
        </div>
    );
}