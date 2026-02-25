import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Hotel as Hospital, MapPin, Loader2 } from 'lucide-react';
import { toast } from "@/components/ui/toaster";
import { supabase } from '@/lib/supabaseClient';

const AddSubClientModal = ({ isOpen, onClose, onSubClientAdded, clientId }) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: "Error de Validación",
        description: "El nombre del laboratorio es obligatorio.",
        variant: "destructive",
      });
      return;
    }
    if (!clientId) {
      toast({
        title: "Error",
        description: "Se debe seleccionar un cliente principal primero.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const { data, error } = await supabase
      .from('sub_clients')
      .insert([{ client_id: clientId, name, address }])
      .select()
      .single();
    setIsLoading(false);

    if (error) {
      toast({
        title: "Error al guardar",
        description: error.code === '23505' ? 'Ya existe un laboratorio con este nombre para este cliente.' : error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Éxito", description: "Laboratorio agregado correctamente." });
      onSubClientAdded(data);
      setName('');
      setAddress('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-slate-100 dark:bg-slate-800">
        <DialogHeader>
          <DialogTitle className="text-2xl text-sky-600 dark:text-sky-400 flex items-center">
            <Hospital className="mr-2 h-6 w-6" /> Agregar Nuevo Laboratorio
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-300">
            Añade un nuevo laboratorio o clínica para el cliente seleccionado.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subClientName" className="flex items-center">
                <Hospital className="mr-2 h-4 w-4 text-sky-500"/> Nombre *
              </Label>
              <Input
                id="subClientName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre del Laboratorio"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subClientAddress" className="flex items-center">
                <MapPin className="mr-2 h-4 w-4 text-sky-500"/> Dirección
              </Label>
              <Input
                id="subClientAddress"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Calle, Número, Localidad"
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Guardar Laboratorio"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSubClientModal;