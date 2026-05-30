import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { useChangePassword } from "../hooks/usePerfil";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// CA008: Validación de complejidad de la contraseña
const formSchema = z
  .object({
    passwordActual: z.string().min(1, "Por favor, introduce datos en este campo"),
    passwordNuevo: z
      .string()
      .min(1, "Por favor, introduce datos en este campo")
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .regex(/[A-Z]/, "Debe contener al menos una letra mayúscula")
      .regex(/[a-z]/, "Debe contener al menos una letra minúscula")
      .regex(/[0-9]/, "Debe contener al menos un número"),
    confirmarPassword: z.string().min(1, "Por favor, introduce datos en este campo"),
  })
  .refine((data) => data.passwordNuevo === data.confirmarPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmarPassword"],
  });

type FormValues = z.infer<typeof formSchema>;

export const FormCambioPassword = () => {
  const mutation = useChangePassword();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      passwordActual: "",
      passwordNuevo: "",
      confirmarPassword: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    mutation.mutate(
      {
        passwordActual: values.passwordActual,
        passwordNuevo: values.passwordNuevo,
      },
      {
        onSuccess: () => {
          form.reset();
        },
      }
    );
  };

  const handleCancel = () => {
    form.reset();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cambiar Contraseña</CardTitle>
        <CardDescription>
          Asegúrate de usar una contraseña larga y compleja para mantener tu cuenta segura.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="passwordActual"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña Actual</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Tu contraseña actual"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="passwordNuevo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nueva Contraseña</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Mínimo 8 caracteres, números y letras"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmarPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Nueva Contraseña</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Vuelve a escribir la nueva contraseña"
                        {...field}
                      />
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
                disabled={!form.formState.isDirty || mutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!form.formState.isDirty || mutation.isPending}
              >
                {mutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Actualizar Contraseña
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
