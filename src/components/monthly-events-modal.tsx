"use client";

import { useState } from "react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface MonthlyEventsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface MonthlyEvent {
    equipo: Equipo;
    eventos: Bitacora[];
}

const MONTHS = [
    { value: "1", label: "Enero" },
    { value: "2", label: "Febrero" },
    { value: "3", label: "Marzo" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Mayo" },
    { value: "6", label: "Junio" },
    { value: "7", label: "Julio" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" }
];

export function MonthlyEventsModal({ open, onOpenChange }: MonthlyEventsModalProps) {
    const [loading, setLoading] = useState(false);
    const [monthlyEvents, setMonthlyEvents] = useState<MonthlyEvent[]>([]);
    const [selectedMonth, setSelectedMonth] = useState<string>("");
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const { toast } = useToast();
    const router = useRouter();

    const years = Array.from(
        { length: 5 },
        (_, i) => (new Date().getFullYear() - 2 + i).toString()
    );

    const fetchMonthlyEvents = async () => {
        if (!selectedMonth || !selectedYear) return;

        setLoading(true);
        try {
            const response = await fetch(
                `/api/equipos/monthly?month=${selectedMonth}&year=${selectedYear}`
            );
            if (!response.ok) {
                throw new Error('Error al obtener eventos mensuales');
            }
            const data = await response.json();
            setMonthlyEvents(data);
        } catch (error) {
            console.error('Error:', error);
            toast({
                title: "Error",
                description: "No se pudieron cargar los eventos del mes",
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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                    <DialogTitle>Eventos por Mes</DialogTitle>
                </DialogHeader>
                <div className="flex items-center gap-4 mb-4">
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Seleccionar mes" />
                        </SelectTrigger>
                        <SelectContent>
                            {MONTHS.map((month) => (
                                <SelectItem key={month.value} value={month.value}>
                                    {month.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Seleccionar año" />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map((year) => (
                                <SelectItem key={year} value={year}>
                                    {year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={fetchMonthlyEvents} disabled={!selectedMonth || !selectedYear}>
                        Buscar
                    </Button>
                </div>
                {loading ? (
                    <div className="flex justify-center items-center p-4">
                        <p>Cargando eventos...</p>
                    </div>
                ) : monthlyEvents.length === 0 ? (
                    <div className="flex justify-center items-center p-4">
                        <p>No hay eventos registrados en este período</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Equipo</TableHead>
                                <TableHead>Ubicación</TableHead>
                                <TableHead>Eventos</TableHead>
                                <TableHead>Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {monthlyEvents.map((item) => (
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
                                                    {evento.tipo}: {evento.descripcion} ({evento.estado})
                                                    <br />
                                                    <span className="text-xs text-muted-foreground">
                                                        {evento.fecha_inicio}
                                                    </span>
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
                )}
            </DialogContent>
        </Dialog>
    );
} 