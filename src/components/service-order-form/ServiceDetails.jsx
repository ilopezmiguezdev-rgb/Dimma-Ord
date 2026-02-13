import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Calendar, FileText, ClipboardCheck } from 'lucide-react';

const ServiceDetails = ({ formData, handleChange }) => {
  return (
    <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 h-full flex flex-col">
      <h3 className="text-lg font-semibold text-sky-700 dark:text-sky-400 mb-4 flex items-center"><FileText className="mr-2 h-5 w-5"/>Detalles del Servicio</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <Label htmlFor="dateReceived" className="flex items-center"><Calendar className="mr-2 h-4 w-4"/>Fecha de Recepción</Label>
          <Input type="date" id="dateReceived" name="dateReceived" value={formData.dateReceived} onChange={handleChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dateCompleted" className="flex items-center"><Calendar className="mr-2 h-4 w-4"/>Fecha de Completado</Label>
          <Input type="date" id="dateCompleted" name="dateCompleted" value={formData.dateCompleted} onChange={handleChange} />
        </div>
      </div>
      <div className="space-y-4 flex-grow flex flex-col">
        <div className="space-y-2">
          <Label htmlFor="reportedIssue">Problema Reportado</Label>
          <Textarea id="reportedIssue" name="reportedIssue" value={formData.reportedIssue} onChange={handleChange} placeholder="Describa el problema reportado por el cliente..." rows={3}/>
        </div>
        <div className="space-y-2 flex-grow flex flex-col">
          <Label htmlFor="workSummary">Resumen del Trabajo Realizado</Label>
          <Textarea id="workSummary" name="workSummary" value={formData.workSummary} onChange={handleChange} placeholder="Describa el trabajo técnico realizado..." className="flex-grow" rows={5}/>
        </div>
        <div className="space-y-2">
          <Label htmlFor="taskTime" className="flex items-center"><Clock className="h-4 w-4 mr-2 text-cyan-500"/>Tiempo de Tarea (horas)</Label>
          <Input id="taskTime" name="taskTime" type="number" step="0.1" value={formData.taskTime} onChange={handleChange} placeholder="Ej: 2.5" />
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;