"use client";

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
import { PlusCircle, Edit, Trash2, History, AlertCircle, Calendar } from "lucide-react";
import { EquipoModal } from "@/components/equipo-modal";
import { useState, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { type Equipo } from "@/lib/firebase/services";
import { toast } from "@/components/ui/use-toast";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { PendingEventsModal } from "@/components/pending-events-modal";
import { MonthlyEventsModal } from "@/components/monthly-events-modal";

export default function EquiposPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);
    const [isMonthlyModalOpen, setIsMonthlyModalOpen] = useState(false);
    const [equipos, setEquipos] = useState<Equipo[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEquipo, setSelectedEquipo] = useState<Equipo | undefined>(undefined);
    const [estadoFilter, setEstadoFilter] = useState<string>("todos");

    const fetchEquipos = async (estado?: string) => {
        try {
            const url = estado && estado !== "todos"
                ? `/api/equipos?estado=${estado}`
                : '/api/equipos';

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Error al cargar los equipos');
            }
            const data = await response.json();
            setEquipos(data);
        } catch (error) {
            console.error('Error:', error);
            toast({
                title: "Error",
                description: "No se pudieron cargar los equipos",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEquipos(estadoFilter);
    }, [estadoFilter]);

    const handleEdit = (equipo: Equipo) => {
        setSelectedEquipo(equipo);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedEquipo(undefined);
        setIsModalOpen(false);
    };

    const handleDelete = async (equipo: Equipo) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este equipo?')) {
            return;
        }

        try {
            const response = await fetch(`/api/equipos/${equipo.id}`, {
                method: 'DELETE',
            });
            const data = await response.json();

            if (!response.ok) {
                toast({
                    title: "Error",
                    description: data.error,
                    variant: "destructive",
                });
                return;
            }

            toast({
                title: "Éxito",
                description: data.message,
            });
            // Recargar la página para ver los cambios
            window.location.reload();
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo eliminar el equipo" + error,
                variant: "destructive",
            });
        }
    };

    // Calculate summary counts
    const activos = equipos.filter(e => e.estado === 'activo').length;
    const enMantenimiento = equipos.filter(e => e.estado === 'mantenimiento').length;
    const noActivos = equipos.filter(e => e.estado === 'no-activo').length;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <Card className="flex-1">
                    <CardHeader>
                        <CardTitle>Resumen de Equipos</CardTitle>
                        <CardDescription>Visualización general del estado de los equipos</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-4 rounded-lg border p-4">
                            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                                <div className="h-4 w-4 text-green-600 dark:text-green-300" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">Activos</p>
                                <p className="text-2xl font-bold">{activos}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4 rounded-lg border p-4">
                            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                                <div className="h-4 w-4 text-yellow-600 dark:text-yellow-300" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">En Mantenimiento</p>
                                <p className="text-2xl font-bold">{enMantenimiento}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4 rounded-lg border p-4">
                            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-full">
                                <div className="h-4 w-4 text-red-600 dark:text-red-300" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">No Activos</p>
                                <p className="text-2xl font-bold">{noActivos}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end space-x-4">
                <Button
                    variant="outline"
                    onClick={() => setIsMonthlyModalOpen(true)}
                >
                    <Calendar className="mr-2 h-4 w-4" />
                    Consulta Mensual
                </Button>
                <Button
                    variant="outline"
                    onClick={() => setIsPendingModalOpen(true)}
                >
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Ver Eventos Pendientes
                </Button>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                        <CardTitle>Lista de Equipos</CardTitle>
                        <CardDescription>
                            Gestione todos los equipos registrados en el sistema
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                        <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filtrar por estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Todos</SelectItem>
                                <SelectItem value="activo">Activos</SelectItem>
                                <SelectItem value="mantenimiento">En Mantenimiento</SelectItem>
                                <SelectItem value="no-activo">No Activos</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button onClick={() => setIsModalOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Nuevo Equipo
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center items-center p-4">
                            <p>Cargando equipos...</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Número de Serie</TableHead>
                                    <TableHead>Modelo</TableHead>
                                    <TableHead>Ubicación</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Observaciones</TableHead>
                                    <TableHead>Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {equipos.map((equipo) => (
                                    <TableRow key={equipo.id}>
                                        <TableCell className="font-medium">{equipo["numero-serie"]}</TableCell>
                                        <TableCell>{equipo.modelo}</TableCell>
                                        <TableCell>{equipo.ubicacion}</TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${equipo.estado === 'activo'
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                                : equipo.estado === 'mantenimiento'
                                                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                                                    : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                                }`}>
                                                {equipo.estado.charAt(0).toUpperCase() + equipo.estado.slice(1)}
                                            </span>
                                        </TableCell>
                                        <TableCell>{equipo.observaciones}</TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleEdit(equipo)}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Editar equipo</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>

                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => {
                                                                    window.location.href = `/equipos/${equipo.id}`;
                                                                }}
                                                            >
                                                                <History className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Ver bitácora</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>

                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-red-600"
                                                                onClick={() => handleDelete(equipo)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Eliminar equipo</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <EquipoModal
                open={isModalOpen}
                onOpenChange={handleCloseModal}
                equipo={selectedEquipo}
            />

            <PendingEventsModal
                open={isPendingModalOpen}
                onOpenChange={setIsPendingModalOpen}
            />

            <MonthlyEventsModal
                open={isMonthlyModalOpen}
                onOpenChange={setIsMonthlyModalOpen}
            />
        </div>
    );
}