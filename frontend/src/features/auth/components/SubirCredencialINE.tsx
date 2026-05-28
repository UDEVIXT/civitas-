"use client";

import { useState, useCallback, useRef } from "react";
import { defineStepper } from "@stepperize/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Definición de pasos ───────────────────────────────────────────────────────

const { Scoped, useStepper, steps } = defineStepper(
    { id: "credencial", title: "Subir credencial" },
    { id: "datos", title: "Subir datos" },
    { id: "registro", title: "Finalizar registro" }
);

// ── Tipos ─────────────────────────────────────────────────────────────────────

type FormData = {
    nombre: string;
    correo: string;
    contrasena: string;
    confirmarContrasena: string;
    numUnidad: string;
};

// ── Stepper visual ────────────────────────────────────────────────────────────

function StepperIndicator() {
    const stepper = useStepper();

    return (
        <div className="flex items-start justify-center">
            {steps.map((step, index) => {
                const isCurrent = stepper.state.current.data.id === step.id;
                const isDone = index < stepper.state.current.index;

                return (
                    <div key={step.id} className="flex items-start">
                        {/* Línea conectora */}
                        {index > 0 && (
                            <div
                                className={cn(
                                    "mt-5 h-px w-12 transition-colors duration-300",
                                    isDone ? "bg-amber-400" : "bg-gray-200"
                                )}
                            />
                        )}

                        {/* Círculo + etiqueta */}
                        <div className="flex flex-col items-center gap-1">
                            <div
                                className={cn(
                                    "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                                    isDone
                                        ? "border-amber-400 bg-amber-400 text-white"
                                        : isCurrent
                                            ? "border-amber-300 bg-white"
                                            : "border-gray-200 bg-white"
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

// ── Paso 1: Subir credencial ──────────────────────────────────────────────────

function StepCredencial() {
    const stepper = useStepper();
    const [images, setImages] = useState<string[]>([]);
    const [activeSlide, setActiveSlide] = useState(0);
    const [dragging, setDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const addFiles = useCallback((files: FileList | null) => {
        if (!files) return;
        Array.from(files).forEach((file) => {
            if (!file.type.startsWith("image/")) return;
            const reader = new FileReader();
            reader.onload = (e) =>
                setImages((prev) => [...prev, e.target?.result as string]);
            reader.readAsDataURL(file);
        });
    }, []);

    const removeImage = (i: number) => {
        setImages((prev) => prev.filter((_, idx) => idx !== i));
        if (activeSlide >= images.length - 1)
            setActiveSlide(Math.max(0, activeSlide - 1));
    };

    return (
        <div className="space-y-4">
            <p className="text-sm font-medium">Sube imágenes de tu credencial</p>

            {/* Drop zone */}
            <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
                onClick={() => inputRef.current?.click()}
                className={cn(
                    "border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-2 cursor-pointer transition-colors",
                    dragging
                        ? "border-amber-400 bg-amber-50"
                        : "border-gray-200 hover:border-amber-300 hover:bg-amber-50/40"
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

            {/* Carrusel de previsualizaciones */}
            {images.length > 0 && (
                <div className="space-y-3">
                    <div className="overflow-hidden rounded-lg">
                        <div
                            className="flex transition-transform duration-300"
                            style={{ transform: `translateX(-${activeSlide * 100}%)` }}
                        >
                            {images.map((src, i) => (
                                <div key={i} className="relative flex-shrink-0 w-full">
                                    <img
                                        src={src}
                                        alt={`Credencial ${i + 1}`}
                                        className="w-full h-40 object-contain bg-gray-50 rounded-lg"
                                    />
                                    <button
                                        onClick={() => removeImage(i)}
                                        className="cursor-pointer absolute top-2 right-2 bg-white rounded-full p-0.5 shadow hover:bg-gray-100 transition"
                                    >
                                        <X className="w-4 h-4 text-gray-600" />
                                    </button>
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
                                        i === activeSlide ? "bg-gray-700" : "bg-gray-300"
                                    )}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Acciones */}
            <div className="flex gap-3 pt-2">
                <Button variant="outline" className="cursor-pointer flex-1">
                    Cancelar
                </Button>
                <Button
                    disabled={images.length === 0}
                    onClick={() => stepper.navigation.next()}
                    className="cursor-pointer flex-1 bg-amber-400 hover:bg-amber-500 text-white font-semibold disabled:opacity-50"
                >
                    Siguiente
                </Button>
            </div>
        </div>
    );
}

// ── Paso 2: Subir datos ───────────────────────────────────────────────────────

function StepDatos({
    form,
    setForm,
}: {
    form: FormData;
    setForm: React.Dispatch<React.SetStateAction<FormData>>;
}) {
    const stepper = useStepper();

    const isValid =
        form.nombre.trim().length > 0 &&
        form.correo.trim().length > 0 &&
        form.contrasena.trim().length > 0 &&
        form.contrasena === form.confirmarContrasena &&
        form.numUnidad.trim().length > 0;

    return (
        <div className="space-y-4">
            <p className="text-sm font-medium">Ingresa tus datos personales</p>

            <div className="space-y-3">
                <div className="space-y-1">
                    <Label htmlFor="nombre">Nombre completo</Label>
                    <Input
                        id="nombre"
                        placeholder="Ej. Juan Pérez García"
                        value={form.nombre}
                        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="correo">Correo electrónico</Label>
                    <Input
                        id="correo"
                        placeholder="Ej. juan.perez@example.com"
                        value={form.correo}
                        onChange={(e) => setForm({ ...form, correo: e.target.value })}
                    />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="contrasena">Contraseña</Label>
                    <Input
                        id="contrasena"
                        type="password"
                        placeholder="Ej. Contraseña123"
                        value={form.contrasena}
                        onChange={(e) => setForm({ ...form, contrasena: e.target.value })}
                    />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="confirmarContrasena">Confirmar contraseña</Label>
                    <Input
                        id="confirmarContrasena"
                        type="password"
                        placeholder="Ej. Contraseña123"
                        value={form.confirmarContrasena}
                        onChange={(e) => setForm({ ...form, confirmarContrasena: e.target.value })}
                    />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="numUnidad">Número de unidad</Label>
                    <Input
                        id="numUnidad"
                        placeholder="Ej. 02"
                        value={form.numUnidad}
                        onChange={(e) => setForm({ ...form, numUnidad: e.target.value })}
                    />
                </div>
            </div>

            <div className="flex gap-3 pt-2">
                <Button variant="outline" className="cursor-pointer flex-1" onClick={() => stepper.navigation.prev()}>
                    Atrás
                </Button>
                <Button
                    disabled={!isValid}
                    onClick={() => stepper.navigation.next()}
                    className="cursor-pointer flex-1 bg-amber-400 hover:bg-amber-500 text-white font-semibold disabled:opacity-50"
                >
                    Siguiente
                </Button>
            </div>
        </div>
    );
}

// ── Paso 3: Finalizar registro ────────────────────────────────────────────────

function StepRegistro({ form }: { form: FormData }) {
    const stepper = useStepper();
    const [enviado, setEnviado] = useState(false);

    if (enviado) {
        return (
            <div className="flex flex-col items-center gap-4 py-8">
                <div className="w-16 h-16 rounded-full bg-amber-400 flex items-center justify-center">
                    <Check className="w-8 h-8 text-white" />
                </div>
                <p className="text-lg font-semibold text-center">¡Registro completado!</p>
                <p className="text-sm text-muted-foreground text-center">
                    Tus datos han sido enviados para su verificación.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <p className="text-sm font-medium">Revisa y confirma tu información</p>

            <div className="rounded-xl border bg-gray-50 p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Credencial</span>
                    <span className="text-green-600 font-medium flex items-center gap-1">
                        <Check className="w-3 h-3" /> Subida
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Nombre</span>
                    <span className="font-medium">{form.nombre}</span>
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
                Al confirmar, aceptas que tus datos serán procesados para verificar tu identidad.
            </p>

            <div className="flex gap-3 pt-2">
                <Button variant="outline" className="cursor-pointer flex-1" onClick={() => stepper.navigation.prev()}>
                    Atrás
                </Button>
                <Button
                    onClick={() => setEnviado(true)}
                    className="cursor-pointer flex-1 bg-amber-400 hover:bg-amber-500 text-white font-semibold"
                >
                    Finalizar
                </Button>
            </div>
        </div>
    );
}

// ── Renderizador del paso activo (debe vivir dentro de Scoped) ────────────────

function StepContent({
    form,
    setForm,
}: {
    form: FormData;
    setForm: React.Dispatch<React.SetStateAction<FormData>>;
}) {
    const stepper = useStepper();

    return stepper.flow.switch({
        credencial: () => <StepCredencial />,
        datos: () => <StepDatos form={form} setForm={setForm} />,
        registro: () => <StepRegistro form={form} />,
    });
}

// ── Componente principal ──────────────────────────────────────────────────────

export function UploadINE() {
    const [form, setForm] = useState<FormData>({
        nombre: "",
        correo: "",
        contrasena: "",
        confirmarContrasena: "",
        numUnidad: "",
    });

    return (
        <div className="flex-1 flex items-center justify-center px-4 py-8 h-full">
            <div className="w-full max-w-md space-y-8">

                {/* Header */}
                <div className="space-y-1 text-center">
                    <h1 className="text-2xl font-bold tracking-tight">Credencial</h1>
                    <p className="text-sm text-muted-foreground">
                        Por favor, ayúdenos a identificarse.
                    </p>
                </div>

                <Scoped>
                    <StepperIndicator />
                    <div className="mt-6">
                        <StepContent form={form} setForm={setForm} />
                    </div>
                </Scoped>

            </div>
        </div>
    );
}