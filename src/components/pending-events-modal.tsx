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
import { Button } from "@/components/ui/button";

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
        return pendingEvents
            .map(item => ({
                equipo: item.equipo,
                eventos: item.eventos.filter(evento => evento.tipo === type)
            }))
            .filter(item => item.eventos.length > 0);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] bg-background dark:bg-background">
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
                                            <div className="rounded-md border">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Equipo</TableHead>
                                                            <TableHead>Descripción</TableHead>
                                                            <TableHead>Estado</TableHead>
                                                            <TableHead>Prioridad</TableHead>
                                                            <TableHead>Responsable</TableHead>
                                                            <TableHead>Duración</TableHead>
                                                            <TableHead>Fecha Inicio</TableHead>
                                                            <TableHead>Acciones</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {filterEventsByType('Incidente').map((item) => (
                                                            item.eventos.map((evento) => (
                                                                <TableRow
                                                                    key={evento.id}
                                                                    className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
                                                                    onClick={() => handleRowClick(item.equipo.id)}
                                                                >
                                                                    <TableCell>
                                                                        <div>
                                                                            <p className="font-medium">{item.equipo["numero-serie"]}</p>
                                                                            <p className="text-sm text-muted-foreground">{item.equipo.ubicacion}</p>
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell>{evento.descripcion}</TableCell>
                                                                    <TableCell>{evento.estado}</TableCell>
                                                                    <TableCell>{evento.prioridad}</TableCell>
                                                                    <TableCell>{evento.responsable}</TableCell>
                                                                    <TableCell>{evento.duracion_horas}h</TableCell>
                                                                    <TableCell>{new Date(evento.fecha_inicio).toLocaleString()}</TableCell>
                                                                    <TableCell>
                                                                        <Button
                                                                            variant="ghost"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleRowClick(item.equipo.id);
                                                                            }}
                                                                        >
                                                                            Ver Equipo
                                                                        </Button>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                            )}
                        </TabsContent>
                        <TabsContent value="mantenimientos">
                            {filterEventsByType('Mantenimiento').length === 0 ? (
                                <div className="flex justify-center items-center p-4">
                                    <p>No hay mantenimientos pendientes</p>
                                </div>
                            ) : (
                                            <div className="rounded-md border">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Equipo</TableHead>
                                                            <TableHead>Descripción</TableHead>
                                                            <TableHead>Estado</TableHead>
                                                            <TableHead>Prioridad</TableHead>
                                                            <TableHead>Responsable</TableHead>
                                                            <TableHead>Duración</TableHead>
                                                            <TableHead>Fecha Inicio</TableHead>
                                                            <TableHead>Acciones</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {filterEventsByType('Mantenimiento').map((item) => (
                                                            item.eventos.map((evento) => (
                                                                <TableRow
                                                                    key={evento.id}
                                                                    className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
                                                                    onClick={() => handleRowClick(item.equipo.id)}
                                                                >
                                                                    <TableCell>
                                                                        <div>
                                                                            <p className="font-medium">{item.equipo["numero-serie"]}</p>
                                                                            <p className="text-sm text-muted-foreground">{item.equipo.ubicacion}</p>
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell>{evento.descripcion}</TableCell>
                                                                    <TableCell>{evento.estado}</TableCell>
                                                                    <TableCell>{evento.prioridad}</TableCell>
                                                                    <TableCell>{evento.responsable}</TableCell>
                                                                    <TableCell>{evento.duracion_horas}h</TableCell>
                                                                    <TableCell>{new Date(evento.fecha_inicio).toLocaleString()}</TableCell>
                                                                    <TableCell>
                                                                        <Button
                                                                            variant="ghost"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleRowClick(item.equipo.id);
                                                                            }}
                                                                        >
                                                                            Ver Equipo
                                                                        </Button>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                            )}
                        </TabsContent>
                    </Tabs>
                )}
            </DialogContent>
        </Dialog>
    );
} 