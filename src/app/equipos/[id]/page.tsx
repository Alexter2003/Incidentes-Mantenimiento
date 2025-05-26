"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle, Clock, PlusCircle, Edit, Trash2, ArrowUpDown, ArrowLeft } from "lucide-react";
import { EventoModal } from "@/components/evento-modal";
import { type Bitacora } from "@/lib/firebase/services";
import { useParams } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Link from "next/link";

export default function BitacoraPage() {
  const params = useParams();
  const equipoId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventos, setEventos] = useState<Bitacora[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvento, setSelectedEvento] = useState<Bitacora | undefined>(undefined);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const { toast } = useToast();
  const [isClosingAll, setIsClosingAll] = useState(false);

  const fetchEventos = async (order: 'asc' | 'desc' = 'desc') => {
    try {
      if (!equipoId) return;
      const response = await fetch(`/api/equipos/${equipoId}/bitacora?orderBy=${order}&orderField=fecha_inicio`);
      if (!response.ok) {
        throw new Error('Error al cargar la bitácora');
      }
      const data = await response.json();
      setEventos(data);
    } catch (error) {
      console.error('Error al cargar la bitácora:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la bitácora",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventos(sortOrder);
  }, [equipoId, sortOrder]);

  const handleEdit = (evento: Bitacora) => {
    setSelectedEvento(evento);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedEvento(undefined);
    setModalMode('create');
    setIsModalOpen(false);
  };

  const handleNewEvento = () => {
    setSelectedEvento(undefined);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  // Calcular estadísticas
  const totalIncidentes = eventos.filter(e => e.tipo === "Incidente").length;
  const tiempoInactividad = eventos.reduce((total, evento) => total + evento.duracion_horas, 0);

  const handleCloseAllEvents = async () => {
    setIsClosingAll(true);
    try {
      const response = await fetch(`/api/equipos/${params.id}/close-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          responsable: "Usuario" // Aquí podrías poner el usuario actual si tienes un sistema de autenticación
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al cerrar los eventos');
      }

      toast({
        title: "Éxito",
        description: data.message,
      });

      // Recargar los datos
      fetchEventos();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "No se pudieron cerrar los eventos",
        variant: "destructive",
      });
    } finally {
      setIsClosingAll(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bitácora del Equipo</h1>
          <p className="text-muted-foreground">
            Historial de incidentes y mantenimientos
          </p>
        </div>
        <div className="space-x-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isClosingAll}>
                {isClosingAll ? "Cerrando eventos..." : "Cerrar Todos los Eventos"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Cerrar todos los eventos?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción cerrará todos los eventos pendientes del equipo y calculará sus duraciones.
                  No se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleCloseAllEvents}>
                  Continuar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button onClick={handleNewEvento}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Evento
          </Button>

          <Link href="/equipos">
            <Button className="bg-blue-500 text-white">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Incidentes
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalIncidentes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tiempo Total de Inactividad
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tiempoInactividad}h</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Eventos Registrados</CardTitle>
          <CardDescription>
            Lista de todos los eventos registrados para este equipo
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center p-4">
              <p>Cargando eventos...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Prioridad</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead onClick={toggleSortOrder} className="cursor-pointer hover:bg-accent hover:text-accent-foreground">
                    <div className="flex items-center">
                      Fecha Inicio
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                      <span className="sr-only">
                        {sortOrder === 'asc' ? 'Ordenar descendente' : 'Ordenar ascendente'}
                      </span>
                    </div>
                  </TableHead>
                  <TableHead>Fecha Resuelto</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eventos.map((evento) => (
                  <TableRow key={evento.id}>
                    <TableCell>{evento.tipo}</TableCell>
                    <TableCell>{evento.descripcion}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${evento.estado === "cerrado"
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                        }`}>
                        {evento.estado ? evento.estado.charAt(0).toUpperCase() + evento.estado.slice(1) : 'Sin estado'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${evento.prioridad === "alta"
                        ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                        : evento.prioridad === "media"
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                          : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        }`}>
                        {evento.prioridad
                          ? evento.prioridad.charAt(0).toUpperCase() + evento.prioridad.slice(1)
                          : 'Sin prioridad'}
                      </span>
                    </TableCell>
                    <TableCell>{evento.responsable || 'Sin asignar'}</TableCell>
                    <TableCell>{evento.duracion_horas ? `${evento.duracion_horas}h` : '-'}</TableCell>
                    <TableCell>{evento.fecha_inicio || '-'}</TableCell>
                    <TableCell>{evento.fecha_resuelto || "-"}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(evento)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Editar evento</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600"
                          onClick={() => {
                            // Aquí iría la lógica para eliminar
                            console.log("Eliminar evento:", evento.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {equipoId && (
        <EventoModal
          open={isModalOpen}
          onOpenChange={handleCloseModal}
          equipoId={equipoId}
          evento={selectedEvento}
          mode={modalMode}
        />
      )}
    </div>
  );
}
