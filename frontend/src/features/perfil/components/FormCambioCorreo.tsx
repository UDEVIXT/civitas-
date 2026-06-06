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
import { usePerfil, useChangeEmail } from "../hooks/usePerfil";
import { Loader2, Mail } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// CA006: Validación de formato de correo
const formSchema = z.object({
  nuevoCorreo: z.string().email("Ingresa un correo electrónico válido"),
});

type FormValues = z.infer<typeof formSchema>;

export const FormCambioCorreo = () => {
  const { data: perfil } = usePerfil();
  const mutation = useChangeEmail();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nuevoCorreo: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values, {
      onSuccess: () => {
        form.reset();
      },
    });
  };

  const handleCancel = () => {
    form.reset();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Correo Electrónico</CardTitle>
        <CardDescription>
          Actualiza la dirección de correo asociada a tu cuenta. Se enviará un enlace de confirmación.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 bg-muted/50 p-4 rounded-lg flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-full text-primary">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium">Correo Actual</p>
            <p className="text-sm text-muted-foreground">{perfil?.correo || "Cargando..."}</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="nuevoCorreo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nuevo Correo Electrónico</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="ejemplo@correo.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                Solicitar Cambio
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
