"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import type { Bitacora } from "@/lib/firebase/services";

interface EventoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipoId: string;
  evento?: Bitacora;
  mode?: 'create' | 'edit';
}

const initialFormData = {
  tipo: "Incidente",
  descripcion: "",
  estado: "abierto",
  prioridad: "baja",
  responsable: "",
  duracion_horas: 0,
  notas: "",
};

export function EventoModal({ open, onOpenChange, equipoId, evento, mode = 'create' }: EventoModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (evento && mode === 'edit') {
      setFormData({
        tipo: evento.tipo,
        descripcion: evento.descripcion,
        estado: evento.estado,
        prioridad: evento.prioridad,
        responsable: evento.responsable,
        duracion_horas: evento.duracion_horas,
        notas: evento.notas,
      });
    } else {
      setFormData(initialFormData);
    }
  }, [evento, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = mode === 'create'
        ? `/api/equipos/${equipoId}/bitacora`
        : `/api/equipos/${equipoId}/bitacora/${evento?.id}`;

      const method = mode === 'create' ? 'POST' : 'PATCH';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Error al ${mode === 'create' ? 'registrar' : 'actualizar'} el evento`);
      }

      toast({
        title: "Éxito",
        description: `Evento ${mode === 'create' ? 'registrado' : 'actualizado'} correctamente`,
      });
      onOpenChange(false);
      // Recargar la página para ver los cambios
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudo ${mode === 'create' ? 'registrar' : 'actualizar'} el evento: ${error}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Registrar Nuevo Evento' : 'Editar Evento'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="tipo">Tipo</Label>
            <Select
              value={formData.tipo}
              onValueChange={(value) => setFormData({ ...formData, tipo: value })}
              disabled={mode === 'edit'} // No permitir cambiar el tipo en modo edición
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Incidente">Incidente</SelectItem>
                <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              required
              disabled={mode === 'edit'} // No permitir cambiar la descripción en modo edición
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="estado">Estado</Label>
            <Select
              value={formData.estado}
              onValueChange={(value) => setFormData({ ...formData, estado: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="abierto">Abierto</SelectItem>
                <SelectItem value="en-proceso">En Proceso</SelectItem>
                <SelectItem value="cerrado">Cerrado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="prioridad">Prioridad</Label>
            <Select
              value={formData.prioridad}
              onValueChange={(value) => setFormData({ ...formData, prioridad: value })}
              disabled={mode === 'edit'} // No permitir cambiar la prioridad en modo edición
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="baja">Baja</SelectItem>
                <SelectItem value="media">Media</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="responsable">Responsable</Label>
            <Input
              id="responsable"
              value={formData.responsable}
              onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="duracion_horas">Duración (horas)</Label>
            <Input
              id="duracion_horas"
              type="number"
              min="0"
              value={formData.duracion_horas}
              onChange={(e) => setFormData({ ...formData, duracion_horas: parseInt(e.target.value) || 0 })}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notas">Notas Adicionales</Label>
            <Textarea
              id="notas"
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : mode === 'create' ? "Guardar" : "Actualizar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
