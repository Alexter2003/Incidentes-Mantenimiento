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

import { useToast } from "@/components/ui/use-toast";
import { type Equipo } from "@/lib/firebase/services";
import { Textarea } from "@/components/ui/textarea";

interface EquipoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipo?: Equipo;
}

export function EquipoModal({ open, onOpenChange, equipo }: EquipoModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    "numero-serie": "",
    modelo: "",
    ubicacion: "",
    estado: "activo",
    observaciones: ""
  });

  // Cargar datos del equipo cuando se abre el modal en modo edición
  useEffect(() => {
    if (equipo) {
      setFormData({
        "numero-serie": equipo["numero-serie"],
        modelo: equipo.modelo,
        ubicacion: equipo.ubicacion,
        estado: equipo.estado,
        observaciones: equipo.observaciones || ""
      });
    } else {
      // Resetear el formulario cuando se abre en modo creación
      setFormData({
        "numero-serie": "",
        modelo: "",
        ubicacion: "",
        estado: "activo",
        observaciones: ""
      });
    }
  }, [equipo, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = equipo ? `/api/equipos/${equipo.id}` : '/api/equipos';
      const method = equipo ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(equipo ? 'Error al actualizar el equipo' : 'Error al crear el equipo');
      }

      const data = await response.json();
      toast({
        title: "Éxito",
        description: equipo
          ? "Equipo actualizado correctamente"
          : "Equipo registrado correctamente con id: " + data.id,
        variant: "default",
      });
      onOpenChange(false);
      // Recargar la página para ver los cambios
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: equipo
          ? "No se pudo actualizar el equipo"
          : "No se pudo registrar el equipo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-background dark:bg-background">
        <DialogHeader>
          <DialogTitle>
            {equipo ? "Editar Equipo" : "Registrar Nuevo Equipo"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="numero-serie">Número de Serie</Label>
            <Input
              id="numero-serie"
              value={formData["numero-serie"]}
              onChange={(e) => setFormData({ ...formData, "numero-serie": e.target.value })}
              required
              className="bg-background"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="modelo">Modelo</Label>
            <Input
              id="modelo"
              value={formData.modelo}
              onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
              required
              className="bg-background"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ubicacion">Ubicación</Label>
            <Input
              id="ubicacion"
              value={formData.ubicacion}
              onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
              required
              className="bg-background"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="estado">Estado</Label>
            <Select
              value={formData.estado}
              onValueChange={(value) => setFormData({ ...formData, estado: value })}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Selecciona un estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                <SelectItem value="no-activo">No Activo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              className="bg-background"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : equipo ? "Actualizar" : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}