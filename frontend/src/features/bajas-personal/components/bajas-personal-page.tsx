"use client";
import { useBajasPersonal } from "../hooks/useBajasPersonal";
import { Search, ClipboardList, Info, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmpleadosPagination } from "@/features/empleados-domesticos/components/empleados-pagination";

function getInitials(name: string) {
  const parts = name.split(" ").filter(Boolean);
  const initials = parts.slice(0, 2).map((part) => part[0]);
  return initials.join("").toUpperCase();
}

export function BajasPersonalPage() {
  const {
    empleados,
    totalPages,
    page,
    setPage,
    search,
    setSearch,
    isListLoading,
    isListError,
    refetchList,
    modal,
  } = useBajasPersonal();

  // Parsing comment details helper
  const parseComentario = (comentario: string | null | undefined) => {
    if (!comentario) {
      return {
        razonPrincipal: "Baja de personal",
        comentarioDetallado: "Sin comentarios registrados para esta baja",
      };
    }

    const matchBaja = comentario.match(/Baja por: (.*?) el (.*?)\. Motivo: (.*)/);
    if (matchBaja) {
      const autor = matchBaja[1];
      const fecha = matchBaja[2];
      const motivoText = matchBaja[3]?.trim();

      return {
        razonPrincipal: `Baja realizada por ${autor} el ${fecha}`,
        comentarioDetallado: motivoText || "Sin comentarios registrados para esta baja",
      };
    }

    return {
      razonPrincipal: "Baja del sistema",
      comentarioDetallado: comentario,
    };
  };

  const parsedBaja = modal.data?.accesos?.[0]
    ? parseComentario(modal.data.accesos[0].comentario_admin)
    : {
        razonPrincipal: "Baja de personal",
        comentarioDetallado: "Sin comentarios registrados para esta baja",
      };

  return (
    <div className="min-h-screen bg-amber-50/30 text-foreground font-sans">
      <main className="mx-auto flex max-w-6xl flex-col px-6 py-8 sm:px-8">
        
        {/* Header and Search */}
        <header className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-red-100 text-red-600">
                <ClipboardList className="size-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Historial y Comentarios de Bajas de Personal
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Visualiza los comentarios y motivos de baja del personal doméstico de la privada.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar empleado por nombre..."
                className="h-10 border-muted-foreground/20 pl-9 transition-all focus:ring-2 focus:ring-primary/20 bg-white"
              />
            </div>
          </div>
        </header>

        {/* Content list */}
        <section className="mt-6 rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
          {isListError ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <AlertTriangle className="size-10 text-red-500 mb-3" />
              <h3 className="text-lg font-semibold text-zinc-900">Error al cargar el historial</h3>
              <p className="text-sm text-muted-foreground max-w-md mt-1">
                Ocurrió un error al obtener la lista de bajas. Por favor, intente de nuevo.
              </p>
              <Button onClick={() => refetchList()} className="mt-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold">
                Reintentar
              </Button>
            </div>
          ) : isListLoading && empleados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="size-8 animate-spin rounded-full border-4 border-amber-400 border-t-transparent" />
              <p className="mt-4 text-sm text-muted-foreground">Cargando historial...</p>
            </div>
          ) : (
            <>
              {/* Responsive Cards for Mobile */}
              <div className="space-y-3 px-4 py-4 md:hidden">
                {empleados.length > 0 ? (
                  empleados.map((empleado) => (
                    <article
                      key={empleado.id_visitante}
                      className="rounded-xl border border-border bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="size-10 border border-border">
                          <AvatarImage
                            src={empleado.url_imagen}
                            alt={empleado.nombre}
                          />
                          <AvatarFallback className="bg-amber-100 text-amber-700 font-semibold">
                            {getInitials(empleado.nombre || "")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {empleado.nombre || "Sin nombre"}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {empleado.telefono || "Sin teléfono"}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="border-red-200 bg-red-50 text-red-700 font-medium"
                        >
                          De baja
                        </Badge>
                      </div>

                      <div className="mt-3 space-y-2 text-xs text-muted-foreground">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-foreground">Tipo de servicio</span>
                          <span className="text-right">
                            {empleado.servicio?.tipo_servicio?.nombre || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-foreground">Vivienda asociada</span>
                          <span className="text-right">
                            {empleado.residente?.vivienda?.numero_vivienda || "N/A"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-amber-200 text-amber-900 hover:bg-amber-50 font-bold"
                          onClick={() => modal.handleOpenDetails(empleado.id_visitante)}
                        >
                          <Info className="size-4 mr-2" />
                          Motivos
                        </Button>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    No se encontraron empleados dados de baja.
                  </div>
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted">
                      <TableHead className="w-60">Nombre</TableHead>
                      <TableHead className="w-40">Tipo de servicio</TableHead>
                      <TableHead className="w-32">Estado</TableHead>
                      <TableHead className="w-32">Vivienda</TableHead>
                      <TableHead className="text-right px-6">&nbsp;</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {empleados.length > 0 ? (
                      empleados.map((empleado) => (
                        <TableRow key={empleado.id_visitante} className="hover:bg-zinc-50/50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="size-10 border border-border">
                                <AvatarImage
                                  src={empleado.url_imagen}
                                  alt={empleado.nombre}
                                />
                                <AvatarFallback className="bg-amber-100 text-amber-700 font-semibold">
                                  {getInitials(empleado.nombre || "")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-semibold text-foreground font-semibold">
                                  {empleado.nombre || "Sin nombre"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {empleado.telefono || "Sin teléfono"}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {empleado.servicio?.tipo_servicio?.nombre || "N/A"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="border-red-200 bg-red-50 text-red-700 font-medium"
                            >
                              De baja
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm font-semibold">
                            {empleado.residente?.vivienda?.numero_vivienda || "N/A"}
                          </TableCell>
                          <TableCell className="text-right px-6">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 rounded-lg border-amber-200 bg-white text-amber-900 hover:bg-amber-50 font-bold"
                              onClick={() => modal.handleOpenDetails(empleado.id_visitante)}
                            >
                              <Info className="size-4 mr-2" />
                              Motivos
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="py-12 text-center text-sm text-muted-foreground"
                        >
                          No se encontraron empleados dados de baja.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {empleados.length > 0 && (
                <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row sm:justify-end">
                  <EmpleadosPagination
                    currentPage={page}
                    totalPages={totalPages}
                    isLoading={isListLoading}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </section>

        {/* Modal: Detalles de Baja */}
        <Dialog open={modal.isOpen} onOpenChange={modal.handleCloseDetails}>
          <DialogContent className="w-[95vw] sm:max-w-md p-6 rounded-2xl bg-white border-none shadow-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="flex flex-col items-center text-center space-y-3 pb-2 relative">
              <DialogTitle className="text-xl font-bold text-gray-900">
                Detalles de Baja
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                Información de la suspensión o baja del empleado.
              </DialogDescription>
            </DialogHeader>

            {modal.isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="size-8 animate-spin rounded-full border-4 border-amber-400 border-t-transparent" />
                <p className="mt-4 text-sm text-muted-foreground">Cargando detalles...</p>
              </div>
            ) : modal.isError ? (
              <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                <AlertTriangle className="size-10 text-red-500 mb-3" />
                <h3 className="text-base font-semibold text-zinc-900">Error de red o del backend</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-normal">
                  No se pudo solicitar el detalle de la baja.
                </p>
                <Button onClick={() => modal.refetch()} className="mt-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs h-9 px-4">
                  Reintentar
                </Button>
              </div>
            ) : modal.data ? (
              <div className="flex flex-col items-center gap-4 mt-2">
                {/* Employee Photo */}
                <Avatar className="size-20 border-2 border-zinc-100 shadow-sm">
                  <AvatarImage
                    src={modal.data.url_imagen}
                    alt={modal.data.nombre}
                  />
                  <AvatarFallback className="bg-amber-100 text-amber-700 font-bold text-xl">
                    {getInitials(modal.data.nombre || "")}
                  </AvatarFallback>
                </Avatar>

                {/* Employee Name */}
                <div className="text-center">
                  <h3 className="text-lg font-bold text-zinc-950">{modal.data.nombre}</h3>
                  {modal.data.servicio?.tipo_servicio?.nombre && (
                    <span className="text-xs text-zinc-500 block mt-0.5">
                      {modal.data.servicio.tipo_servicio.nombre}
                    </span>
                  )}
                </div>

                <div className="w-full space-y-4 border-t pt-4">
                  {/* Razón principal de baja */}
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                      Razón Principal de Baja
                    </span>
                    <p className="text-sm font-medium text-zinc-800 bg-zinc-50 border p-2.5 rounded-lg">
                      {parsedBaja.razonPrincipal}
                    </p>
                  </div>

                  {/* Comentario detallado */}
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                      Comentario Detallado
                    </span>
                    <div className="max-h-40 overflow-y-auto border border-zinc-100 bg-zinc-50/50 p-3 rounded-lg text-sm text-zinc-700 whitespace-pre-wrap break-words leading-relaxed">
                      {parsedBaja.comentarioDetallado}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <DialogFooter className="mt-6">
              <Button
                type="button"
                onClick={modal.handleCloseDetails}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold h-11 rounded-xl"
              >
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </main>
    </div>
  );
}
