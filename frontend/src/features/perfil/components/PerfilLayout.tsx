import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormDatosPersonales } from "./FormDatosPersonales";
import { FormCambioPassword } from "./FormCambioPassword";
import { FormCambioCorreo } from "./FormCambioCorreo";
import { UserCircle, Shield, Mail } from "lucide-react";
import { usePerfil } from "../hooks/usePerfil";

export const PerfilLayout = () => {
  const { data: perfil } = usePerfil();

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
        <p className="text-muted-foreground mt-2">
          Administra la información de tu cuenta, seguridad y preferencias.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/4">
          <div className="bg-muted/50 rounded-lg p-6 text-center space-y-4">
        <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
          {perfil?.urlImagen ? (
            <img
              src={perfil.urlImagen}
              alt="Foto de perfil"
              className="w-full h-full object-cover"
            />
          ) : (
            <UserCircle className="w-16 h-16 text-primary" />
          )}
        </div>
            <div>
              <h2 className="font-semibold text-lg">{perfil?.nombreUsuario || "Cargando..."}</h2>
              <p className="text-sm text-muted-foreground capitalize">{perfil?.rol || ""}</p>
            </div>
          </div>
        </div>

        <div className="md:w-3/4">
          <Tabs defaultValue="datos" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none h-auto bg-transparent p-0 mb-6 space-x-6">
              <TabsTrigger
                value="datos"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-3"
              >
                <UserCircle className="w-4 h-4 mr-2" />
                Datos Personales
              </TabsTrigger>
              <TabsTrigger
                value="seguridad"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-3"
              >
                <Shield className="w-4 h-4 mr-2" />
                Seguridad
              </TabsTrigger>
              <TabsTrigger
                value="correo"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-3"
              >
                <Mail className="w-4 h-4 mr-2" />
                Correo
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="datos" className="mt-0">
              <FormDatosPersonales />
            </TabsContent>
            
            <TabsContent value="seguridad" className="mt-0">
              <FormCambioPassword />
            </TabsContent>
            
            <TabsContent value="correo" className="mt-0">
              <FormCambioCorreo />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
