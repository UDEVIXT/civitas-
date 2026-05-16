//BitacoraGuardiaPage.tsx
"use client";

import * as React from "react";
import { TablaAccesosGuardia } from "./TablaAccesosGuardia";
import { FiltrosTabla } from "./FiltrosTabla";
import { BitacoraFiltro, BitacoraRegistro } from "../api/bitacora";
import { useBitacoraHistorica } from "../hooks/useBitacora";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ModalRegistrarSalida } from "../components/ModalRegistrarSalida";
import { bitacoraService } from "@/services/bitacora.service";
import { toast } from "sonner";

export function BitacoraGuardiaPage() {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const [filters, setFilters] = React.useState<BitacoraFiltro>({
    page: "1",
    limit: "10",
    ordenar: "reciente",
  });

  // Limpiar filtros que no deben enviarse al backend
  const cleanFilters = React.useMemo(() => {
    const cleaned: BitacoraFiltro = {};

    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "" && value !== "todos") {
        cleaned[key as keyof BitacoraFiltro] = value;
      }
    });

    return cleaned;
  }, [filters]);

  const {
    data: bitacoraData,
    isLoading,
    error,
    refetch,
  } = useBitacoraHistorica(cleanFilters);

  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [isMassModalOpen, setIsMassModalOpen] = React.useState(false);
  const [registroParaSalida, setRegistroParaSalida] =
    React.useState<BitacoraRegistro | null>(null);
  const [isMassLoading, setIsMassLoading] = React.useState(false);

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleFilterChange = (newFilters: Partial<BitacoraFiltro>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: "1", // Reset page when filters change
    }));
    setSelectedIds([]);
  };

  const handleClearFilters = () => {
    setFilters({
      page: "1",
      limit: "10",
      ordenar: "reciente",
    });
    setSelectedIds([]);
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      page: page.toString(),
    }));
    setSelectedIds([]);
  };

  const handleSuccess = () => {
    refetch();
    setRegistroParaSalida(null);
    setIsMassModalOpen(false);
    setSelectedIds([]);
  };

  const confirmMassExit = async () => {
    if (selectedIds.length === 0) return;
    setIsMassLoading(true);
    try {
      await Promise.all(selectedIds.map(id => bitacoraService.registrarSalida(id.toString())));
      handleSuccess();
    } catch (error) {
      console.error("Error al registrar salidas masivas:", error);
      toast.error("Error al registrar las salidas masivas. Intenta nuevamente.", {
        description: "Ocurrió un error al registrar las salidas masivas. Por favor, intenta nuevamente.",
      });
    } finally {
      setIsMassLoading(false);
    }
  };

  const selectedRecordsData =
    bitacoraData?.data?.filter((r: BitacoraRegistro) =>
      selectedIds.includes(r.id)
    ) || [];

  if (!isMounted) {
    return null; // Evita el error de hidratación forzando el render solo en el navegador
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">
          Historial de Accesos (Guardia)
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Supervisa todas las entradas y autoriza las salidas de la residencia.
        </p>
      </div>
      <FiltrosTabla
        filters={filters}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
        selectedIds={selectedIds}
        onMassExitClick={() => setIsMassModalOpen(true)}
      />
      <TablaAccesosGuardia
        filtros={cleanFilters}
        onPageChange={handlePageChange}
        bitacoraData={bitacoraData}
        isLoading={isLoading}
        error={error}
        refetch={refetch}
        selectedIds={selectedIds}
        onToggleSelection={toggleSelection}
        onRegisterExitClick={(registro) => setRegistroParaSalida(registro)}
      />

      {registroParaSalida && (
        <ModalRegistrarSalida
          isOpen={!!registroParaSalida}
          onClose={() => setRegistroParaSalida(null)}
          onSuccess={handleSuccess}
          registro={registroParaSalida}
        />
      )}

      <Dialog
        open={isMassModalOpen}
        onOpenChange={(open) => !isMassLoading && setIsMassModalOpen(open)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Confirmar Salida Masiva</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              Se registrará la salida para {selectedIds.length} persona(s). Esta
              acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
              {selectedRecordsData.map((reg: BitacoraRegistro) => (
                <div key={reg.id} className="p-3 border rounded-md text-sm grid grid-cols-2 gap-2 text-left bg-muted/30">
                  <p><span className="font-medium">Nombre:</span> {reg.nombre}</p>
                  <p><span className="font-medium">Tipo:</span> {reg.tipo_persona}</p>
                  {reg.residente_asociado?.nombre && <p><span className="font-medium">Asociado a:</span> {reg.residente_asociado.nombre}</p>}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsMassModalOpen(false)} disabled={isMassLoading} className="cursor-pointer">Cancelar</Button>
            <Button onClick={confirmMassExit} disabled={isMassLoading || selectedIds.length === 0} className="cursor-pointer">
              {isMassLoading ? "Registrando..." : `Confirmar ${selectedIds.length} Salidas`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
