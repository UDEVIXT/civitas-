"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import apiClient from "@/api/axios"; // Importación de tu cliente configurado
import { Spinner } from "@/components/ui/spinner";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  
  const [verificando, setVerificando] = useState(true);
  
  // useRef evita que el useEffect se dispare dos veces en React Strict Mode
  const verificacionIniciada = useRef(false);

  useEffect(() => {
    // Si no hay token en la URL, detenemos la carga
    if (!token) {
      setVerificando(false);
      return;
    }

    // Evitamos peticiones duplicadas al servidor
    if (verificacionIniciada.current) return;
    verificacionIniciada.current = true;

    async function verificarCuenta() {
      try {
        // Utilizamos apiClient. Solo pasamos la ruta relativa.
        const response = await apiClient.get(`/auth/verify-email?token=${token}`);
        
        toast.success(response.data?.message || "Correo verificado exitosamente.");
        
        // Redirigir al usuario para que inicie sesión
        router.push("/login");
        
      } catch (error: unknown) {
        console.error("Error en verificación:", error);
        
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        
        toast.error(
          axiosError.response?.data?.message || 
          "Error al verificar la cuenta o el enlace es inválido."
        );
      } finally {
        setVerificando(false);
      }
    }

    verificarCuenta();
  }, [token, router]);

  return (
    <div className="flex flex-col h-screen items-center justify-center space-y-4 px-4 text-center">
      {verificando ? (
        <>
          <Spinner className="w-8 h-8 text-amber-500" />
          <p className="text-muted-foreground text-sm font-medium">
            Verificando tu cuenta, por favor espera...
          </p>
        </>
      ) : !token ? (
        <div className="space-y-2">
          <p className="text-destructive font-medium text-lg">
            Enlace de verificación no válido.
          </p>
          <p className="text-sm text-muted-foreground">
            Asegúrate de haber copiado el enlace completo de tu correo.
          </p>
        </div>
      ) : (
        <p className="text-muted-foreground font-medium">
          Proceso finalizado. Redirigiendo...
        </p>
      )}
    </div>
  );
}