"use client";

// Componentes
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

// Hooks
import { useAuth } from "../hooks/useAuth";

// Iconst
import { EyeIcon, EyeOffIcon } from "lucide-react";

export function LoginForm() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [recordarme, setRecordarme] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!usuario.trim()) {
      newErrors.user = "Debe introducir un usuario";
    } else if (usuario.trim().length < 3) {
      newErrors.user = "El nombre de usuario debe tener al menos 3 caracteres";
    }

    if (!password.trim()) {
      newErrors.password = "Debe introducir una contraseña";
    } else if (password.trim().length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    try {
      await login({ usuario, password, recordarme });
      router.push("/");
    } catch (error: unknown) {
      setIsLoading(false);
      console.error(error);

      const axiosError = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      if (axiosError.response?.status === 401) {
        toast.error(
          axiosError.response.data?.message || "Error al iniciar sesión",
        );
      } else {
        toast.error("Error al iniciar sesión");
      }
    }
    setIsLoading(false);
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-8 h-full">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Iniciar sesión</h1>
          <p className="text-muted-foreground">
            ¡Bienvenido de nuevo!, Porfavor introduzca sus datos.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="user">Usuario</Label>
            <Input
              id="user"
              type="text"
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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Contraseña</Label>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={errors.password ? "true" : undefined}
                aria-describedby={errors.password ? "password-error" : undefined}
                className="pr-9"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="text-sm text-destructive">
                {errors.password}
              </p>
            )}
            <div className="flex items-center justify-between min-w-full">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember-me"
                  checked={recordarme}
                  onCheckedChange={(checked) => setRecordarme(checked === true)}
                />
                <Label htmlFor="remember-me" className="text-sm font-normal">
                  Recordar sesión
                </Label>
              </div>
              <a
                href="#"
                className="text-sm text-primary hover:underline font-semibold"
              >
                ¿Olvidaste la contraseña?
              </a>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? <Spinner /> : "Iniciar Sesión"}
          </Button>

          <div className="text-center text-sm">
            <p className="text-muted-foreground">
              ¿No tienes cuenta?{" "}
              <a href="#" className="text-primary hover:underline font-medium">
                Regístrate
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
