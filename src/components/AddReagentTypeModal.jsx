import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FlaskConical, PlusCircle, Trash2 } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";

const AddReagentTypeModal = ({ isOpen, onClose, onSave }) => {
  const [reagentName, setReagentName] = useState('');
  const [sizes, setSizes] = useState(['']); 

  const handleSizeChange = (index, value) => {
    const newSizes = [...sizes];
    newSizes[index] = value;
    setSizes(newSizes);
  };

  const addSizeField = () => {
    setSizes([...sizes, '']);
  };

  const removeSizeField = (index) => {
    const newSizes = sizes.filter((_, i) => i !== index);
    setSizes(newSizes);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const filteredSizes = sizes.map(s => s.trim()).filter(s => s !== '');
    if (!reagentName.trim() || filteredSizes.length === 0) {
      toast({
        title: "Error de Validación",
        description: "Por favor, ingrese el nombre del reactivo y al menos un tamaño válido.",
        variant: "destructive",
      });
      return;
    }
    await onSave({ name: reagentName.trim(), sizes: filteredSizes });
    setReagentName('');
    setSizes(['']);
  };
  
  const handleClose = () => {
      setReagentName('');
      setSizes(['']);
      onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-slate-100 dark:bg-slate-800 border-teal-500 text-slate-800 dark:text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl text-teal-600 dark:text-teal-400 flex items-center">
            <FlaskConical className="mr-2 h-6 w-6" /> Agregar Nuevo Tipo de Reactivo
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-300">
            Ingresa el nombre del nuevo reactivo y sus tamaños disponibles.
          </DialogDescription>
        </DialogHeader>
        <form id="add-reagent-form" onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reagentName" className="text-slate-700 dark:text-slate-300 font-semibold">Nombre del Reactivo *</Label>
              <Input
                id="reagentName"
                value={reagentName}
                onChange={(e) => setReagentName(e.target.value)}
                className="bg-slate-50 dark:bg-slate-700 border-teal-300 dark:border-teal-600"
                placeholder="Ej: Diluyente Especial"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-300 font-semibold">Tamaños Disponibles *</Label>
              {sizes.map((size, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={size}
                    onChange={(e) => handleSizeChange(index, e.target.value)}
                    className="flex-grow bg-slate-50 dark:bg-slate-700 border-teal-300 dark:border-teal-600"
                    placeholder="Ej: 500ml, 1L, Kit x20"
                  />
                  {sizes.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeSizeField(index)} className="text-red-500 hover:text-red-400">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addSizeField} className="mt-2 text-teal-500 border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/50 dark:text-teal-400 dark:border-teal-700">
                <PlusCircle className="mr-2 h-4 w-4" /> Agregar Otro Tamaño
              </Button>
            </div>
          </div>
        </form>
         <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="text-slate-700 dark:text-slate-300 border-slate-400 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700">
                Cancelar
              </Button>
            <Button type="submit" form="add-reagent-form" className="bg-teal-500 hover:bg-teal-600 text-white">
              Guardar Reactivo
            </Button>
          </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddReagentTypeModal;