import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePerfil, useUpdatePerfil } from "../hooks/usePerfil";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// CA005 y CA006: Validación de campos requeridos y formatos
const formSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  apellidos: z.string().min(1, "Los apellidos son requeridos"),
  telefono: z
    .string()
    .min(10, "El teléfono debe tener al menos 10 dígitos")
    .regex(/^[0-9]+$/, "El teléfono solo puede contener números") // CA006
    .max(15, "El teléfono no puede exceder 15 dígitos"),
});

type FormValues = z.infer<typeof formSchema>;

export const FormDatosPersonales = () => {
  const { data: perfil, isLoading } = usePerfil();
  const updateMutation = useUpdatePerfil();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      apellidos: "",
      telefono: "",
    },
  });

  useEffect(() => {
    if (perfil) {
      form.reset({
        nombre: perfil.nombre,
        apellidos: perfil.apellidos,
        telefono: perfil.telefono,
      });
    }
  }, [perfil, form]);

  const onSubmit = (values: FormValues) => {
    updateMutation.mutate(values);
  };

  const handleCancel = () => {
    // CA004: Cancela la edición y descarta lo capturado
    if (perfil) {
      form.reset({
        nombre: perfil.nombre,
        apellidos: perfil.apellidos,
        telefono: perfil.telefono,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos Personales</CardTitle>
        <CardDescription>
          Actualiza tu información personal para mantener tu perfil al día.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Tu nombre" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="apellidos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellidos</FormLabel>
                    <FormControl>
                      <Input placeholder="Tus apellidos" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telefono"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input placeholder="Tu número telefónico" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={!form.formState.isDirty || updateMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!form.formState.isDirty || updateMutation.isPending}
              >
                {updateMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Guardar Cambios
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
