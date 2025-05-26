"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { type Bitacora, type Equipo } from "@/lib/firebase/services";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PendingEventsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface PendingEvent {
    equipo: Equipo;
    eventos: Bitacora[];
}

export function PendingEventsModal({ open, onOpenChange }: PendingEventsModalProps) {
    const [loading, setLoading] = useState(true);
    const [pendingEvents, setPendingEvents] = useState<PendingEvent[]>([]);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        if (open) {
            fetchPendingEvents();
        }
    }, [open]);

    const fetchPendingEvents = async () => {
        try {
            const response = await fetch('/api/equipos/pending');
            if (!response.ok) {
                throw new Error('Error al obtener eventos pendientes');
            }
            const data = await response.json();
            setPendingEvents(data);
        } catch (error) {
            console.error('Error:', error);
            toast({
                title: "Error",
                description: "No se pudieron cargar los eventos pendientes",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRowClick = (equipoId: string) => {
        router.push(`/equipos/${equipoId}`);
        onOpenChange(false);
    };

    const filterEventsByType = (type: 'Incidente' | 'Mantenimiento') => {
        return pendingEvents.filter(item =>
            item.eventos.some(evento => evento.tipo === type)
        ).map(item => ({
            ...item,
            eventos: item.eventos.filter(evento => evento.tipo === type)
        }));
    };

    const EventsTable = ({ events }: { events: PendingEvent[] }) => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Equipo</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Eventos Pendientes</TableHead>
                    <TableHead>Estado</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {events.map((item) => (
                    <TableRow
                        key={item.equipo.id}
                        className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
                        onClick={() => handleRowClick(item.equipo.id)}
                    >
                        <TableCell>
                            <div>
                                <p className="font-medium">{item.equipo["numero-serie"]}</p>
                                <p className="text-sm text-muted-foreground">{item.equipo.modelo}</p>
                            </div>
                        </TableCell>
                        <TableCell>{item.equipo.ubicacion}</TableCell>
                        <TableCell>
                            <ul className="list-disc list-inside">
                                {item.eventos.map((evento) => (
                                    <li key={evento.id} className="text-sm">
                                        {evento.descripcion} ({evento.estado})
                                    </li>
                                ))}
                            </ul>
                        </TableCell>
                        <TableCell>
                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${item.equipo.estado === 'activo'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                : item.equipo.estado === 'mantenimiento'
                                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                                    : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                }`}>
                                {item.equipo.estado.charAt(0).toUpperCase() + item.equipo.estado.slice(1)}
                            </span>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                    <DialogTitle>Eventos Pendientes</DialogTitle>
                </DialogHeader>
                {loading ? (
                    <div className="flex justify-center items-center p-4">
                        <p>Cargando eventos pendientes...</p>
                    </div>
                ) : pendingEvents.length === 0 ? (
                    <div className="flex justify-center items-center p-4">
                        <p>No hay eventos pendientes</p>
                    </div>
                ) : (
                    <Tabs defaultValue="incidentes" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="incidentes">Incidentes</TabsTrigger>
                            <TabsTrigger value="mantenimientos">Mantenimientos</TabsTrigger>
                        </TabsList>
                        <TabsContent value="incidentes">
                            {filterEventsByType('Incidente').length === 0 ? (
                                <div className="flex justify-center items-center p-4">
                                    <p>No hay incidentes pendientes</p>
                                </div>
                            ) : (
                                <EventsTable events={filterEventsByType('Incidente')} />
                            )}
                        </TabsContent>
                        <TabsContent value="mantenimientos">
                            {filterEventsByType('Mantenimiento').length === 0 ? (
                                <div className="flex justify-center items-center p-4">
                                    <p>No hay mantenimientos pendientes</p>
                                </div>
                            ) : (
                                <EventsTable events={filterEventsByType('Mantenimiento')} />
                            )}
                        </TabsContent>
                    </Tabs>
                )}
            </DialogContent>
        </Dialog>
    );
} 