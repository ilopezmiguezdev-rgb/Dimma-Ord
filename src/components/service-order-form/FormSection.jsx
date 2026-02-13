import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BadgeInfo, UserCog, ListChecks } from 'lucide-react';

const FormSection = ({ formData, handleSelectChange, handleChange }) => {
  return (
    <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold text-sky-700 dark:text-sky-400 mb-4 flex items-center"><BadgeInfo className="mr-2 h-5 w-5"/>Estado y Tipo de Orden</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="order_type" className="flex items-center"><ListChecks className="mr-2 h-4 w-4"/>Tipo de Orden</Label>
          <Select name="order_type" value={formData.order_type} onValueChange={(value) => handleSelectChange('order_type', value)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Instalacion">Instalación</SelectItem>
              <SelectItem value="Visita">Visita</SelectItem>
              <SelectItem value="Service">Service</SelectItem>
              <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Estado</Label>
          <Select name="status" value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="Pendiente">Pendiente</SelectItem><SelectItem value="En Progreso">En Progreso</SelectItem><SelectItem value="Completada">Completada</SelectItem><SelectItem value="Facturado">Facturado</SelectItem><SelectItem value="Cancelado">Cancelado</SelectItem></SelectContent>
          </Select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="assigned_technician" className="flex items-center"><UserCog className="mr-2 h-4 w-4"/>Técnico Asignado</Label>
          <Input id="assigned_technician" name="assigned_technician" value={formData.assigned_technician} onChange={handleChange} />
        </div>
      </div>
    </div>
  );
};

export default FormSection;