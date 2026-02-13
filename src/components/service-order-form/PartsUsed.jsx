import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Trash2, Wrench } from 'lucide-react';

const PartsUsed = ({ formData, setFormData }) => {
  const handlePartChange = (index, e) => {
    const { name, value } = e.target;
    const newParts = [...formData.partsUsed];
    newParts[index] = { ...newParts[index], [name]: value };
    
    const quantity = parseInt(newParts[index].quantity, 10) || 0;
    const unitCost = parseInt(newParts[index].unitCost, 10) || 0;
    newParts[index].totalCost = quantity * unitCost;

    setFormData(prev => ({ ...prev, partsUsed: newParts }));
  };

  const addPart = () => {
    setFormData(prev => ({
      ...prev,
      partsUsed: [...(prev.partsUsed || []), { id: uuidv4(), partName: '', quantity: 1, unitCost: 0, totalCost: 0 }]
    }));
  };

  const removePart = (id) => {
    setFormData(prev => ({
      ...prev,
      partsUsed: prev.partsUsed.filter(part => part.id !== id)
    }));
  };

  return (
    <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold text-sky-700 dark:text-sky-400 mb-4 flex items-center"><Wrench className="mr-2 h-5 w-5"/>Repuestos Utilizados</h3>
      <div className="space-y-3 max-h-48 overflow-y-auto pr-2 styled-scrollbar">
        {(formData.partsUsed || []).map((part, index) => (
          <div key={part.id} className="grid grid-cols-1 sm:grid-cols-[4fr,1fr,1.5fr,auto] gap-2 items-center">
            <Input name="partName" placeholder="Nombre del Repuesto" value={part.partName} onChange={(e) => handlePartChange(index, e)} />
            <Input name="quantity" type="number" step="1" placeholder="Cant." value={part.quantity} onChange={(e) => handlePartChange(index, e)} className="w-20" />
            <Input name="unitCost" type="number" step="1" placeholder="Costo U." value={part.unitCost} onChange={(e) => handlePartChange(index, e)} className="w-32" />
            <Button type="button" variant="destructive" size="icon" onClick={() => removePart(part.id)} className="h-8 w-8"><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
      </div>
      <Button type="button" variant="outline" onClick={addPart} className="mt-3 w-full border-dashed"><PlusCircle className="mr-2 h-4 w-4" /> Añadir Repuesto</Button>
    </div>
  );
};

export default PartsUsed;