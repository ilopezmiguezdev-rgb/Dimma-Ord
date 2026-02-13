import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Home, FileText } from 'lucide-react';
import { toast } from "@/components/ui/toaster";

const AddClientModal = ({ isOpen, onClose, onSave }) => {
  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clientName.trim()) {
      toast({
        title: "Error de Validación",
        description: "El nombre del cliente es obligatorio.",
        variant: "destructive",
      });
      return;
    }
    await onSave({ name: clientName, address: clientAddress });
    setClientName('');
    setClientAddress('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-slate-100 dark:bg-slate-800 border-indigo-500 text-slate-800 dark:text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl text-indigo-600 dark:text-indigo-400 flex items-center">
            <UserPlus className="mr-2 h-6 w-6" /> Agregar Nuevo Cliente
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-300">
            Ingresa los detalles del nuevo cliente.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="clientName" className="text-right col-span-1 text-slate-700 dark:text-slate-300 flex items-center justify-end">
                <FileText className="mr-1 h-4 w-4 text-indigo-500"/> Nombre *
              </Label>
              <Input
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="col-span-3 bg-slate-50 dark:bg-slate-700 border-indigo-300 dark:border-indigo-600"
                placeholder="Nombre de la Clínica o Sanatorio"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="clientAddress" className="text-right col-span-1 text-slate-700 dark:text-slate-300 flex items-center justify-end">
                <Home className="mr-1 h-4 w-4 text-indigo-500"/> Dirección
              </Label>
              <Input
                id="clientAddress"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                className="col-span-3 bg-slate-50 dark:bg-slate-700 border-indigo-300 dark:border-indigo-600"
                placeholder="Calle, Número, Localidad, Provincia"
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="text-slate-700 dark:text-slate-300 border-slate-400 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" className="bg-indigo-500 hover:bg-indigo-600 text-white">
              Guardar Cliente
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddClientModal;