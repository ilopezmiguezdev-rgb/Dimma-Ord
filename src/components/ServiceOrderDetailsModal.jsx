import React from 'react';
import { motion } from 'framer-motion';
import { Eye, X, Printer, Building, Package, AlertTriangle, Wrench, Clock, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getStatusColorSolid as getStatusColor, getPriorityColor } from '@/lib/orderUtils';

const ServiceOrderDetailsModal = ({ order, isOpen, onClose, logoUrl }) => {
  if (!order) return null;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Reporte de Orden de Servicio - ' + order.id + '</title>');
    
    printWindow.document.write('<style>');
    printWindow.document.write(`
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f7f6; color: #333; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .print-container { max-width: 800px; margin: 20px auto; padding: 20px; background-color: #fff; box-shadow: 0 0 10px rgba(0,0,0,0.1); border-radius: 8px; }
      .print-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0ea5e9; padding-bottom: 15px; margin-bottom: 25px; }
      .print-header h2 { font-size: 1.8em; color: #0369a1; margin: 0; }
      .print-header img { max-height: 40px; border-radius: 4px;}
      .print-section { margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px dashed #e2e8f0; }
      .print-section:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0;}
      .print-section h3 { font-size: 1.3em; color: #0ea5e9; margin-top: 0; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
      .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 25px; }
      .text-sm { font-size: 0.95em; line-height: 1.6; }
      .text-sm p { margin: 5px 0; }
      strong { font-weight: 600; color: #374151; }
      .badge { padding: 4px 10px; border-radius: 12px; font-size: 0.8em; color: white; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px; }
      .status-pendiente { background-color: #f59e0b; }
      .status-enprogreso { background-color: #0ea5e9; }
      .status-completada { background-color: #10b981; }
      .status-cancelada { background-color: #ef4444; }
      .status-default { background-color: #64748b; }
      .priority-alta { border: 1px solid #ef4444; color: #ef4444; }
      .priority-media { border: 1px solid #f59e0b; color: #f59e0b; }
      .priority-baja { border: 1px solid #10b981; color: #10b981; }
      .priority-default { border: 1px solid #64748b; color: #64748b; }
      .costs-summary { margin-top: 20px; padding-top: 15px; border-top: 2px solid #0ea5e9; }
      .costs-summary p { margin: 8px 0; font-size: 1em; }
      .costs-summary .total-cost { font-size: 1.2em; font-weight: bold; color: #059669; }
      ul { list-style-type: disc; padding-left: 20px; }
      li { margin-bottom: 5px; }
      .footer-print { text-align: center; font-size: 0.8em; color: #6b7280; margin-top: 30px; padding-top: 10px; border-top: 1px solid #e5e7eb; }
      @media print {
        body { margin: 0; background-color: #fff; }
        .print-container { box-shadow: none; border-radius: 0; margin: 0; max-width: 100%; }
        .no-print { display: none; }
      }
    `);
    printWindow.document.write('</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write('<div class="print-container">');
    
    printWindow.document.write('<div class="print-header">');
    printWindow.document.write(`<h2>Orden de Servicio: ${order.id}</h2>`);
    if (logoUrl) {
      printWindow.document.write(`<img src="${logoUrl}" alt="Logo Dimma"/>`);
    }
    printWindow.document.write('</div>');

    printWindow.document.write('<div class="print-section grid-2">');
    printWindow.document.write('<div class="text-sm"><h3>Información del Cliente</h3>');
    printWindow.document.write(`<p><strong>Cliente:</strong> ${order.client_name || 'N/A'}</p>`);
    printWindow.document.write(`<p><strong>Laboratorio / Clínica:</strong> ${order.sub_client_name || 'N/A'}</p>`);
    printWindow.document.write(`<p><strong>Dirección:</strong> ${order.client_location || 'N/A'}</p>`);
    printWindow.document.write(`<p><strong>Contacto:</strong> ${order.client_contact || 'N/A'}</p></div>`);
    
    printWindow.document.write('<div class="text-sm"><h3>Información del Equipo</h3>');
    printWindow.document.write(`<p><strong>Tipo:</strong> ${order.equipment_type || 'N/A'}</p>`);
    printWindow.document.write(`<p><strong>Marca:</strong> ${order.equipment_brand || 'N/A'}</p>`);
    printWindow.document.write(`<p><strong>Modelo:</strong> ${order.equipment_model || 'N/A'}</p>`);
    printWindow.document.write(`<p><strong>N/S:</strong> ${order.equipment_serial || 'N/A'}</p></div>`);
    printWindow.document.write('</div>');

    printWindow.document.write('<div class="print-section text-sm"><h3>Problema Reportado</h3>');
    printWindow.document.write(`<p>${order.reported_issue || 'No especificado.'}</p></div>`);

    if (order.work_summary) {
      printWindow.document.write('<div class="print-section text-sm"><h3>Resumen del Trabajo Realizado</h3>');
      printWindow.document.write(`<p>${order.work_summary}</p></div>`);
    }
    
    if (order.task_time) {
      printWindow.document.write('<div class="print-section text-sm"><h3>Tiempo de Tarea Realizada</h3>');
      printWindow.document.write(`<p>${order.task_time} horas</p></div>`);
    }

    printWindow.document.write('<div class="print-section text-sm"><h3>Repuestos Utilizados</h3>');
    if (order.parts_used && order.parts_used.length > 0) {
      printWindow.document.write('<ul>');
      order.parts_used.forEach(part => {
        printWindow.document.write(`<li>${part.partName || part.name} (x${part.quantity || 0}) - ${(part.totalCost || part.totalPrice || 0).toFixed(2)}</li>`);
      });
      printWindow.document.write('</ul>');
    } else {
      printWindow.document.write('<p>No se utilizaron repuestos.</p>');
    }
    printWindow.document.write('</div>');

    printWindow.document.write('<div class="costs-summary print-section"><h3>Resumen de Costos</h3>');
    printWindow.document.write(`<p><strong>Costo Mano de Obra:</strong> ${(order.labor_cost || 0).toFixed(2)}</p>`);
    printWindow.document.write(`<p><strong>Costo Repuestos:</strong> ${(order.parts_cost || 0).toFixed(2)}</p>`);
    printWindow.document.write(`<p><strong>Costo Traslado:</strong> ${(order.transport_cost || 0).toFixed(2)}</p>`);
    printWindow.document.write(`<p class="total-cost"><strong>Costo Total:</strong> ${(order.total_cost || 0).toFixed(2)}</p>`);
    printWindow.document.write('</div>');
    
    let statusClass = 'status-default';
    if (order.status === 'Pendiente') statusClass = 'status-pendiente';
    else if (order.status === 'En Progreso') statusClass = 'status-enprogreso';
    else if (order.status === 'Completada') statusClass = 'status-completada';
    else if (order.status === 'Cancelada') statusClass = 'status-cancelada';

    let priorityClass = 'priority-default';
    if (order.priority === 'Alta') priorityClass = 'priority-alta';
    else if (order.priority === 'Media') priorityClass = 'priority-media';
    else if (order.priority === 'Baja') priorityClass = 'priority-baja';

    printWindow.document.write('<div class="print-section text-sm"><h3>Otros Detalles</h3>');
    printWindow.document.write(`<p><strong>Técnico Asignado:</strong> ${order.assigned_technician || 'N/A'}</p>`);
    printWindow.document.write(`<p><strong>Fecha de Recepción:</strong> ${order.date_received ? new Date(order.date_received).toLocaleDateString('es-AR', { timeZone: 'UTC' }) : 'N/A'}</p>`);
    printWindow.document.write(`<p><strong>Fecha de Completado:</strong> ${order.date_completed ? new Date(order.date_completed).toLocaleDateString('es-AR', { timeZone: 'UTC' }) : 'N/A'}</p>`);
    printWindow.document.write(`<p><strong>Estado Actual:</strong> <span class="badge ${statusClass}">${order.status || 'N/A'}</span></p>`);
    printWindow.document.write(`<p><strong>Prioridad:</strong> <span class="badge ${priorityClass}">${order.priority || 'N/A'}</span></p></div>`);
    
    printWindow.document.write('<div class="footer-print">Servicio Técnico Dimma - Reporte Generado el ' + new Date().toLocaleDateString('es-AR') + '</div>');
    printWindow.document.write('</div></body></html>');
    printWindow.document.close();
    
    setTimeout(() => {
      try {
        printWindow.print();
        printWindow.close();
      } catch (e) {
        console.error("Error al imprimir:", e);
        printWindow.close();
        alert("Hubo un error al intentar imprimir. Por favor, intente guardar como PDF desde el diálogo de impresión.");
      }
    }, 500);
  };


  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-slate-50 dark:bg-slate-800/90 backdrop-blur-lg border-sky-500/50 text-slate-800 dark:text-white max-w-2xl p-0 shadow-2xl rounded-xl">
        <DialogHeader className="p-6 bg-gradient-to-br from-sky-500/20 to-teal-500/20 dark:from-sky-600/30 dark:to-teal-600/30 rounded-t-xl flex flex-row justify-between items-center">
          <div className="flex items-center">
            <Eye className="h-7 w-7 mr-3 text-sky-600 dark:text-sky-400"/>
            <div>
              <DialogTitle className="text-2xl md:text-3xl font-bold text-sky-700 dark:text-sky-300">Detalles de Orden: {order.id}</DialogTitle>
              <DialogDescription className="text-sky-600/80 dark:text-sky-300/80">
                Información completa de la orden de servicio.
              </DialogDescription>
            </div>
          </div>
          {logoUrl && <img src={logoUrl} alt="Logo Dimma" className="h-8 rounded-md no-print"/>}
        </DialogHeader>
        <div className="p-6 max-h-[70vh] overflow-y-auto styled-scrollbar">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-6 pb-6 border-b border-sky-500/30">
              <div>
                <h3 className="text-lg font-semibold text-sky-700 dark:text-sky-300 mb-2 flex items-center"><Building className="h-5 w-5 mr-2 text-sky-600 dark:text-sky-400"/>Información del Cliente</h3>
                <p className="text-sm"><strong className="text-slate-600 dark:text-slate-300">Cliente:</strong> {order.client_name}</p>
                <p className="text-sm"><strong className="text-slate-600 dark:text-slate-300">Laboratorio / Clínica:</strong> {order.sub_client_name || 'N/A'}</p>
                <p className="text-sm"><strong className="text-slate-600 dark:text-slate-300">Dirección:</strong> {order.client_location || 'N/A'}</p>
                <p className="text-sm"><strong className="text-slate-600 dark:text-slate-300">Contacto:</strong> {order.client_contact || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-sky-700 dark:text-sky-300 mb-2 flex items-center"><Package className="h-5 w-5 mr-2 text-sky-600 dark:text-sky-400"/>Información del Equipo</h3>
                <p className="text-sm"><strong className="text-slate-600 dark:text-slate-300">Tipo:</strong> {order.equipment_type}</p>
                <p className="text-sm"><strong className="text-slate-600 dark:text-slate-300">Marca:</strong> {order.equipment_brand}</p>
                <p className="text-sm"><strong className="text-slate-600 dark:text-slate-300">Modelo:</strong> {order.equipment_model}</p>
                <p className="text-sm"><strong className="text-slate-600 dark:text-slate-300">N/S:</strong> {order.equipment_serial || 'N/A'}</p>
              </div>
            </div>

            <div className="mb-6 pb-6 border-b border-sky-500/30">
              <h3 className="text-lg font-semibold text-sky-700 dark:text-sky-300 mb-2 flex items-center"><AlertTriangle className="h-5 w-5 mr-2 text-amber-600 dark:text-amber-400"/>Problema Reportado</h3>
              <p className="text-sm bg-slate-200/50 dark:bg-slate-700/50 p-3 rounded-md">{order.reported_issue || 'No especificado.'}</p>
            </div>
            
            <div className="mb-6 pb-6 border-b border-sky-500/30">
              <h3 className="text-lg font-semibold text-sky-700 dark:text-sky-300 mb-2 flex items-center"><Wrench className="h-5 w-5 mr-2 text-emerald-600 dark:text-emerald-400"/>Resumen del Trabajo</h3>
              {order.work_summary ? (
                <p className="text-sm bg-slate-200/50 dark:bg-slate-700/50 p-3 rounded-md">{order.work_summary}</p>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400 italic">No se ha registrado un resumen del trabajo.</p>
              )}
            </div>

            {typeof order.task_time === 'number' && order.task_time > 0 && (
              <div className="mb-6 pb-6 border-b border-sky-500/30">
                <h3 className="text-lg font-semibold text-sky-700 dark:text-sky-300 mb-2 flex items-center"><Clock className="h-5 w-5 mr-2 text-cyan-600 dark:text-cyan-400"/>Tiempo de Tarea Realizada</h3>
                <p className="text-sm bg-slate-200/50 dark:bg-slate-700/50 p-3 rounded-md">{order.task_time} horas</p>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-sky-700 dark:text-sky-300 mb-2 flex items-center"><Hash className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400"/>Repuestos Utilizados</h3>
              {order.parts_used && order.parts_used.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 pl-2">
                  {order.parts_used.map((part, index) => (
                    <li key={index} className="text-sm">
                      {part.partName || part.name} (x{part.quantity}) - ${(part.totalCost || part.totalPrice || 0).toFixed(2)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400 italic">No se utilizaron repuestos.</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-sky-500/30">
                <div className="bg-slate-200/50 dark:bg-slate-700/50 p-4 rounded-lg">
                    <p className="text-xs text-sky-700 dark:text-sky-300 uppercase">Mano de Obra</p>
                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">${(order.labor_cost || 0).toFixed(2)}</p>
                </div>
                <div className="bg-slate-200/50 dark:bg-slate-700/50 p-4 rounded-lg">
                    <p className="text-xs text-sky-700 dark:text-sky-300 uppercase">Repuestos</p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">${(order.parts_cost || 0).toFixed(2)}</p>
                </div>
                <div className="bg-slate-200/50 dark:bg-slate-700/50 p-4 rounded-lg">
                    <p className="text-xs text-sky-700 dark:text-sky-300 uppercase">Traslado</p>
                    <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">${(order.transport_cost || 0).toFixed(2)}</p>
                </div>
                <div className="bg-teal-500/20 dark:bg-teal-600/30 p-4 rounded-lg text-center ring-2 ring-teal-500 md:col-span-2">
                    <p className="text-sm text-teal-700 dark:text-teal-200 uppercase font-semibold">Costo Total</p>
                    <p className="text-2xl font-bold text-teal-600 dark:text-teal-300">${(order.total_cost || 0).toFixed(2)}</p>
                </div>
            </div>

            <div className="mt-6 text-xs text-slate-500 dark:text-slate-400">
              <p><strong className="text-slate-600 dark:text-slate-300">Técnico Asignado:</strong> {order.assigned_technician || 'N/A'}</p>
              <p><strong className="text-slate-600 dark:text-slate-300">Fecha de Recepción:</strong> {order.date_received ? new Date(order.date_received).toLocaleDateString('es-AR', { timeZone: 'UTC' }) : 'N/A'}</p>
              <p><strong className="text-slate-600 dark:text-slate-300">Fecha de Completado:</strong> {order.date_completed ? new Date(order.date_completed).toLocaleDateString('es-AR', { timeZone: 'UTC' }) : 'N/A'}</p>
              <p><strong className="text-slate-600 dark:text-slate-300">Estado Actual:</strong> <Badge className={`${getStatusColor(order.status)} text-xs text-white`}>{order.status}</Badge></p>
              <p><strong className="text-slate-600 dark:text-slate-300">Prioridad:</strong> <Badge variant="outline" className={`${getPriorityColor(order.priority)} text-xs`}>{order.priority}</Badge></p>
            </div>

          </motion.div>
        </div>
        <DialogFooter className="p-6 bg-slate-100 dark:bg-slate-800/80 rounded-b-xl border-t border-sky-500/30 no-print">
          <Button variant="outline" onClick={onClose} className="text-slate-700 dark:text-slate-300 border-slate-400 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700">
            <X className="h-4 w-4 mr-2" /> Cerrar
          </Button>
          <Button onClick={handlePrint} className="bg-teal-500 hover:bg-teal-600 text-white">
            <Printer className="h-4 w-4 mr-2" /> Imprimir / Exportar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceOrderDetailsModal;