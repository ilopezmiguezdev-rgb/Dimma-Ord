import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, Timer, Truck } from 'lucide-react';

const CostsSummary = ({ formData, handleChange }) => {
  return (
    <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold text-sky-700 dark:text-sky-400 mb-4 flex items-center"><DollarSign className="mr-2 h-5 w-5"/>Costos y Mano de Obra</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="laborHours" className="flex items-center"><Timer className="mr-2 h-4 w-4"/>Horas de Mano de Obra</Label>
          <Input id="laborHours" name="laborHours" type="number" step="0.5" value={formData.laborHours || ''} onChange={handleChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="laborRate">Tarifa por Hora ($)</Label>
          <Input id="laborRate" name="laborRate" type="number" step="1" value={formData.laborRate || ''} onChange={handleChange} />
        </div>
        <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="transportCost" className="flex items-center"><Truck className="mr-2 h-4 w-4"/>Costo de Traslado ($)</Label>
            <Input id="transportCost" name="transportCost" type="number" step="1" value={formData.transportCost || ''} onChange={handleChange} />
        </div>
      </div>
      <div className="mt-4 p-4 bg-gradient-to-r from-sky-100 via-teal-100 to-emerald-100 dark:from-sky-900/50 dark:via-teal-900/50 dark:to-emerald-900/50 rounded-lg shadow-inner">
        <div className="flex justify-between items-center text-sm mb-2">
          <span className="text-slate-600 dark:text-slate-300">Costo de Repuestos:</span>
          <span className="font-bold text-sky-600 dark:text-sky-400">${formData.partsCost || 0}</span>
        </div>
        <div className="flex justify-between items-center text-sm mb-2">
          <span className="text-slate-600 dark:text-slate-300">Costo de Mano de Obra:</span>
          <span className="font-bold text-sky-600 dark:text-sky-400">${formData.laborCost || 0}</span>
        </div>
        <div className="flex justify-between items-center text-sm mb-3">
          <span className="text-slate-600 dark:text-slate-300">Costo de Traslado:</span>
          <span className="font-bold text-sky-600 dark:text-sky-400">${formData.transportCost || 0}</span>
        </div>
        <div className="flex justify-between items-center text-lg font-bold mt-2 pt-2 border-t border-teal-500/30">
          <span className="text-slate-700 dark:text-slate-200">Costo Total:</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">${formData.totalCost || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default CostsSummary;