import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login() {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-8 h-full">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Iniciar sesión</h1>
          <p className="text-muted-foreground">
            ¡Bienvenido de nuevo!, Porfavor introduzca sus datos.
          </p>
        </div>

        <form className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="user">Usuario</Label>
            <Input id="user" type="text" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Contraseña</Label>
            </div>
            <Input id="password" type="password" />
            <div className="flex items-end justify-end min-w-full">
              <a href="#" className="text-sm text-primary hover:underline ">
                ¿Olvidaste la contraseña?
              </a>
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg">
            Iniciar Sesión
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
