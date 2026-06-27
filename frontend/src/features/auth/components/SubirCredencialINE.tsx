"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { defineStepper } from "@stepperize/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { verifyCredentialRequest, registerRequest } from "../api/auth";

const { Scoped, useStepper, steps } = defineStepper(
  { id: "credencial", title: "Subir credencial" },
  { id: "datos", title: "Subir datos" },
  { id: "registro", title: "Finalizar registro" },
);

type FormData = {
  nombre: string;
  correo: string;
  contrasena: string;
  confirmarContrasena: string;
  numUnidad: string;
  genero: string;
  fecha_nacimiento: string;
  telefono: string;
  nombre_usuario: string;
};

type ImageItem = {
  file: File;
  preview: string;
};

function StepperIndicator() {
  const stepper = useStepper();

  return (
    <div className="flex items-start justify-center">
      {steps.map((step, index) => {
        const isCurrent = stepper.state.current.data.id === step.id;
        const isDone = index < stepper.state.current.index;

        return (
          <div key={step.id} className="flex items-start">
            {index > 0 && (
              <div
                className={cn(
                  "mt-5 h-px w-12 transition-colors duration-300",
                  isDone ? "bg-amber-400" : "bg-gray-200",
                )}
              />
            )}
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                  isDone
                    ? "border-amber-400 bg-amber-400 text-white"
                    : isCurrent
                      ? "border-amber-300 bg-white"
                      : "border-gray-200 bg-white",
                )}
              >
                {isDone ? (
                  <Check className="w-4 h-4" />
                ) : isCurrent ? (
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                ) : (
                  <div className="w-3 h-3 rounded-full bg-gray-200" />
                )}
              </div>
              <span className="text-[10px] text-gray-500 text-center w-16 leading-tight">
                {step.title}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StepCredencial({ rol }: { rol: string }) {
  const stepper = useStepper();
  const router = useRouter();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);


  const addFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const newImages: ImageItem[] = [];
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const preview = URL.createObjectURL(file);
      newImages.push({ file, preview });
    });
    setImages((prev) => {
      const combined = [...prev, ...newImages];
      return combined.slice(0, 2);
    });
  }, []);

  const removeImage = (i: number) => {
    const item = images[i];
    URL.revokeObjectURL(item.preview);
    setImages((prev) => prev.filter((_, idx) => idx !== i));
    if (activeSlide >= images.length - 1)
      setActiveSlide(Math.max(0, activeSlide - 1));
  };

  async function handleNext() {
    if (images.length < 2) {
      toast.error("Debes subir ambas caras de tu credencial (frente y reverso)");
      return;
    }

    setVerifying(true);
    try {
      const res = await verifyCredentialRequest(
        rol,
        images[0].file,
        images[1].file,
      );
      localStorage.setItem("verificationAccessToken", res.data.verificationAccessToken);
      toast.success(res.message || "Credencial verificada correctamente");
      stepper.navigation.next();
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      toast.error(
        axiosError.response?.data?.message || "Error al verificar la credencial",
      );
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium">Sube imágenes de tu credencial</p>
      <p className="text-xs text-muted-foreground">
        Agrega exactamente 2 imágenes: el frente y el reverso de tu INE.
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-2 cursor-pointer transition-colors",
          dragging
            ? "border-amber-400 bg-amber-50"
            : "border-gray-200 hover:border-amber-300 hover:bg-amber-50/40",
        )}
      >
        <Upload className="w-8 h-8 text-gray-400" />
        <p className="text-sm text-center">
          <span className="text-amber-500 font-medium">Da clic</span>{" "}
          o arrastra un archivo y suéltalo aquí
        </p>
        <p className="text-xs text-muted-foreground">PNG o JPG</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {images.length > 0 && (
        <div className="space-y-3">
          <div className="overflow-hidden rounded-lg">
            <div
              className="flex transition-transform duration-300"
              style={{ transform: `translateX(-${activeSlide * 100}%)` }}
            >
              {images.map((item, i) => (
                <div key={i} className="relative flex-shrink-0 w-full">
                  <img
                    src={item.preview}
                    alt={`Credencial ${i + 1}`}
                    className="w-full h-40 object-contain bg-gray-50 rounded-lg"
                  />
                  <button
                    onClick={() => removeImage(i)}
                    className="cursor-pointer absolute top-2 right-2 bg-white rounded-full p-0.5 shadow hover:bg-gray-100 transition"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                  <span
                    className={cn(
                      "absolute bottom-2 left-2 text-xs font-medium px-2 py-0.5 rounded",
                      i === 0
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700",
                    )}
                  >
                    {i === 0 ? "Frente" : "Reverso"}
                  </span>
                </div>
              ))}
            </div>
          </div>
          {images.length > 1 && (
            <div className="flex justify-center gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSlide(i)}
                  className={cn(
                    "cursor-pointer w-2 h-2 rounded-full transition-colors",
                    i === activeSlide ? "bg-gray-700" : "bg-gray-300",
                  )}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button variant="outline" className="cursor-pointer flex-1" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button
          disabled={images.length === 0 || verifying}
          onClick={handleNext}
          className="cursor-pointer flex-1 bg-amber-400 hover:bg-amber-500 text-white font-semibold disabled:opacity-50"
        >
          {verifying ? <Spinner className="size-4" /> : "Siguiente"}
        </Button>
      </div>
    </div>
  );
}

function FieldWrapper({
  label,
  error,
  htmlFor,
  children,
}: {
  label: string;
  error?: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function StepDatos({
  form,
  setForm,
}: {
  form: FormData;
  setForm: React.Dispatch<React.SetStateAction<FormData>>;
}) {
  const stepper = useStepper();
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  function validate(): Record<string, string> {
    const e: Record<string, string> = {};

    if (!form.nombre.trim()) e.nombre = "El nombre es obligatorio";
    else if (form.nombre.trim().length < 3) e.nombre = "Mínimo 3 caracteres";

    if (!form.nombre_usuario.trim()) e.nombre_usuario = "El usuario es obligatorio";
    else if (form.nombre_usuario.trim().length < 3) e.nombre_usuario = "Mínimo 3 caracteres";
    else if (!/^[a-zA-Z0-9_]+$/.test(form.nombre_usuario)) e.nombre_usuario = "Solo letras, números y guion bajo";

    if (!form.genero) e.genero = "Selecciona un género";

    if (!form.fecha_nacimiento) e.fecha_nacimiento = "La fecha es obligatoria";
    else {
      const nac = new Date(form.fecha_nacimiento);
      const hoy = new Date();
      const edad = hoy.getFullYear() - nac.getFullYear();
      const mes = hoy.getMonth() - nac.getMonth();
      if (edad < 18 || (edad === 18 && mes < 0)) e.fecha_nacimiento = "Debes ser mayor de 18 años";
    }

    if (!form.telefono.trim()) e.telefono = "El teléfono es obligatorio";
    else if (!/^\d{10}$/.test(form.telefono.trim())) e.telefono = "Deben ser 10 dígitos";

    if (!form.correo.trim()) e.correo = "El correo es obligatorio";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo.trim())) e.correo = "Correo electrónico inválido";

    if (!form.contrasena) e.contrasena = "La contraseña es obligatoria";
    else if (form.contrasena.length < 8) e.contrasena = "Mínimo 8 caracteres";
    else if (!/[A-Za-z]/.test(form.contrasena)) e.contrasena = "Debe contener al menos una letra";
    else if (!/[0-9]/.test(form.contrasena)) e.contrasena = "Debe contener al menos un número";

    if (!form.confirmarContrasena) e.confirmarContrasena = "Confirma tu contraseña";
    else if (form.contrasena !== form.confirmarContrasena) e.confirmarContrasena = "Las contraseñas no coinciden";

    if (!form.numUnidad.trim()) e.numUnidad = "El número de unidad es obligatorio";

    return e;
  }

  const errors = validate();
  const isValid = Object.keys(errors).length === 0;

  function handleBlur(field: string) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium">Ingresa tus datos personales</p>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <FieldWrapper label="Nombre completo" error={touched.nombre ? errors.nombre : undefined} htmlFor="nombre">
            <Input
              id="nombre"
              placeholder="Ej. Juan Pérez García"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              onBlur={() => handleBlur("nombre")}
              aria-invalid={!!errors.nombre && touched.nombre}
            />
          </FieldWrapper>
          <FieldWrapper label="Nombre de usuario" error={touched.nombre_usuario ? errors.nombre_usuario : undefined} htmlFor="nombre_usuario">
            <Input
              id="nombre_usuario"
              placeholder="Ej. juanperez"
              value={form.nombre_usuario}
              onChange={(e) => setForm({ ...form, nombre_usuario: e.target.value })}
              onBlur={() => handleBlur("nombre_usuario")}
              aria-invalid={!!errors.nombre_usuario && touched.nombre_usuario}
            />
          </FieldWrapper>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FieldWrapper label="Género" error={touched.genero ? errors.genero : undefined} htmlFor="genero">
            <Select
              value={form.genero}
              onValueChange={(value) => {
                setForm({ ...form, genero: value });
                setTouched((prev) => ({ ...prev, genero: true }));
              }}
            >
              <SelectTrigger id="genero">
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Masculino">Masculino</SelectItem>
                <SelectItem value="Femenino">Femenino</SelectItem>
                <SelectItem value="Prefiero no decirlo">
                  Prefiero no decirlo
                </SelectItem>
              </SelectContent>
            </Select>
          </FieldWrapper>
          <FieldWrapper label="Fecha de nacimiento" error={touched.fecha_nacimiento ? errors.fecha_nacimiento : undefined} htmlFor="fecha_nacimiento">
            <Input
              id="fecha_nacimiento"
              type="date"
              value={form.fecha_nacimiento}
              onChange={(e) => setForm({ ...form, fecha_nacimiento: e.target.value })}
              onBlur={() => handleBlur("fecha_nacimiento")}
              aria-invalid={!!errors.fecha_nacimiento && touched.fecha_nacimiento}
            />
          </FieldWrapper>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FieldWrapper label="Teléfono" error={touched.telefono ? errors.telefono : undefined} htmlFor="telefono">
            <Input
              id="telefono"
              type="tel"
              placeholder="Ej. 9511234567"
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              onBlur={() => handleBlur("telefono")}
              aria-invalid={!!errors.telefono && touched.telefono}
            />
          </FieldWrapper>
          <FieldWrapper label="Correo electrónico" error={touched.correo ? errors.correo : undefined} htmlFor="correo">
            <Input
              id="correo"
              type="email"
              placeholder="Ej. juan.perez@example.com"
              value={form.correo}
              onChange={(e) => setForm({ ...form, correo: e.target.value })}
              onBlur={() => handleBlur("correo")}
              aria-invalid={!!errors.correo && touched.correo}
            />
          </FieldWrapper>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FieldWrapper label="Contraseña" error={touched.contrasena ? errors.contrasena : undefined} htmlFor="contrasena">
            <Input
              id="contrasena"
              type="password"
              placeholder="Mín. 8 caracteres, 1 letra y 1 número"
              value={form.contrasena}
              onChange={(e) => setForm({ ...form, contrasena: e.target.value })}
              onBlur={() => handleBlur("contrasena")}
              aria-invalid={!!errors.contrasena && touched.contrasena}
            />
          </FieldWrapper>
          <FieldWrapper label="Confirmar contraseña" error={touched.confirmarContrasena ? errors.confirmarContrasena : undefined} htmlFor="confirmarContrasena">
            <Input
              id="confirmarContrasena"
              type="password"
              placeholder="Repite la contraseña"
              value={form.confirmarContrasena}
              onChange={(e) =>
                setForm({ ...form, confirmarContrasena: e.target.value })
              }
              onBlur={() => handleBlur("confirmarContrasena")}
              aria-invalid={!!errors.confirmarContrasena && touched.confirmarContrasena}
            />
          </FieldWrapper>
        </div>

        <FieldWrapper label="Número de unidad" error={touched.numUnidad ? errors.numUnidad : undefined} htmlFor="numUnidad">
          <Input
            id="numUnidad"
            placeholder="Ej. 02"
            value={form.numUnidad}
            onChange={(e) => setForm({ ...form, numUnidad: e.target.value })}
            onBlur={() => handleBlur("numUnidad")}
            aria-invalid={!!errors.numUnidad && touched.numUnidad}
          />
        </FieldWrapper>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          variant="outline"
          className="cursor-pointer flex-1"
          onClick={() => stepper.navigation.prev()}
        >
          Atrás
        </Button>
        <Button
          disabled={!isValid}
          onClick={() => {
            setTouched({
              nombre: true, nombre_usuario: true, genero: true,
              fecha_nacimiento: true, telefono: true, correo: true,
              contrasena: true, confirmarContrasena: true, numUnidad: true,
            });
            if (isValid) stepper.navigation.next();
          }}
          className="cursor-pointer flex-1 bg-amber-400 hover:bg-amber-500 text-white font-semibold disabled:opacity-50"
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}

function StepRegistro({ form, rol }: { form: FormData; rol: string }) {
  const stepper = useStepper();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const token = localStorage.getItem("verificationAccessToken");
      if (!token) {
        toast.error("La verificación de credencial ha expirado. Regresa al paso anterior.");
        setSubmitting(false);
        return;
      }

      await registerRequest({
        nombre: form.nombre,
        genero: form.genero,
        fecha_nacimiento: form.fecha_nacimiento,
        telefono: form.telefono,
        nombre_usuario: form.nombre_usuario,
        correo: form.correo,
        password: form.contrasena,
        confirmPassword: form.confirmarContrasena,
        rol,
        verificationAccessToken: token,
      });

      localStorage.removeItem("verificationAccessToken");
      toast.success("Se ha enviado un correo de verificación a tu correo electrónico.");
      router.push("/login");
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string | string[] } };
      };
      const msg = axiosError.response?.data?.message;
      const errorMsg = Array.isArray(msg) ? msg.join(" | ") : msg || "Error al registrar";
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium">Revisa y confirma tu información</p>

      <div className="rounded-xl border bg-gray-50 p-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Credencial</span>
          <span className="text-green-600 font-medium flex items-center gap-1">
            <Check className="w-3 h-3" /> Verificada
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Nombre</span>
          <span className="font-medium">{form.nombre}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Usuario</span>
          <span className="font-medium">{form.nombre_usuario}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Género</span>
          <span className="font-medium">{form.genero}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Fecha de nacimiento</span>
          <span className="font-medium">{form.fecha_nacimiento}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Teléfono</span>
          <span className="font-medium">{form.telefono}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Correo</span>
          <span className="font-medium">{form.correo}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Número de unidad</span>
          <span className="font-medium">{form.numUnidad}</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Al confirmar, aceptas que tus datos serán procesados para verificar tu
        identidad.
      </p>

      <div className="flex gap-3 pt-2">
        <Button
          variant="outline"
          className="cursor-pointer flex-1"
          onClick={() => stepper.navigation.prev()}
        >
          Atrás
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="cursor-pointer flex-1 bg-amber-400 hover:bg-amber-500 text-white font-semibold disabled:opacity-50"
        >
          {submitting ? <Spinner className="size-4" /> : "Finalizar"}
        </Button>
      </div>
    </div>
  );
}

function StepContent({
  form,
  setForm,
  rol,
}: {
  form: FormData;
  setForm: React.Dispatch<React.SetStateAction<FormData>>;
  rol: string;
}) {
  const stepper = useStepper();

  return stepper.flow.switch({
    credencial: () => <StepCredencial rol={rol} />,
    datos: () => <StepDatos form={form} setForm={setForm} />,
    registro: () => <StepRegistro form={form} rol={rol} />,
  });
}

export function UploadINE({ rol }: { rol: string }) {
  const [form, setForm] = useState<FormData>({
    nombre: "",
    correo: "",
    contrasena: "",
    confirmarContrasena: "",
    numUnidad: "",
    genero: "",
    fecha_nacimiento: "",
    telefono: "",
    nombre_usuario: "",
  });

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-8 h-full">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Credencial</h1>
          <p className="text-sm text-muted-foreground">
            Por favor, ayúdenos a identificarse.
          </p>
        </div>

        <Scoped>
          <StepperIndicator />
          <div className="mt-6">
            <StepContent form={form} setForm={setForm} rol={rol} />
          </div>
        </Scoped>
      </div>
    </div>
  );
}
