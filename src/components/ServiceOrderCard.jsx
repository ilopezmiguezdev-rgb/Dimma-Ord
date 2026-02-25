import React from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Eye, Calendar, User, Package, AlertTriangle, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { getStatusColor, getOrderTypeColor } from '@/lib/orderUtils';

const ServiceOrderCard = ({ order, index, onViewDetails, onEditOrder, onDeleteOrder }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-white dark:bg-slate-800/50 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-slate-200 dark:border-slate-700/50 flex flex-col overflow-hidden"
    >
      <div className={`p-3 border-l-4 ${getOrderTypeColor(order.order_type).replace('text-', 'border-').replace('dark:text-', 'dark:border-')}`}>
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="font-bold text-sky-800 dark:text-sky-300 text-md truncate block" title={order.client_name}>{order.client_name}</span>
            {order.sub_client_name && (
              <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-1">
                <Building className="h-3 w-3 mr-1.5 flex-shrink-0" />
                <span className="truncate" title={order.sub_client_name}>{order.sub_client_name}</span>
              </div>
            )}
          </div>
          <Badge variant="outline" className={`text-xs px-2 py-0.5 ${getOrderTypeColor(order.order_type)}`}>{order.order_type || 'N/A'}</Badge>
        </div>
        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mb-3">
          <Calendar className="h-3 w-3 mr-1.5" />
          {order.creation_date ? format(parseISO(order.creation_date), 'dd MMM yyyy', { locale: es }) : 'N/A'}
        </div>
        <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
          <div className="flex items-start">
            <Package className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-slate-400" />
            <p className="truncate" title={`${order.equipment_model} (S/N: ${order.equipment_serial})`}>{order.equipment_model || 'Equipo no especificado'} (S/N: {order.equipment_serial || 'N/A'})</p>
          </div>
          <div className="flex items-start">
            <User className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-slate-400" />
            <p className="truncate" title={order.assigned_technician || 'No asignado'}>{order.assigned_technician || 'No asignado'}</p>
          </div>
          {typeof order.transport_cost === 'number' && (
             <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 pl-6">
                <span>Traslado: ${order.transport_cost}</span>
             </div>
          )}
        </div>
      </div>

      <div className="p-3 mt-auto bg-slate-50 dark:bg-slate-800/30">
        <div className="flex justify-between items-center mb-3">
            <Badge className={`${getStatusColor(order.status)} text-xs font-medium`}>{order.status}</Badge>
            <div className="flex flex-col items-end">
              <span className="text-xs text-slate-500 dark:text-slate-400">Total</span>
              <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400">${order.total_cost || 0}</span>
            </div>
        </div>
        <div className="flex justify-end space-x-1 mt-2">
          <Button variant="ghost" size="icon" onClick={() => onViewDetails(order)} aria-label="Ver detalles" className="text-sky-600 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300 h-8 w-8" title="Ver Detalles">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onEditOrder(order)} aria-label="Editar orden" className="text-amber-500 hover:text-amber-400 dark:text-yellow-400 dark:hover:text-yellow-300 h-8 w-8" title="Editar">
            <Edit className="h-4 w-4" />
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Eliminar orden" className="text-red-600 hover:text-red-500 dark:text-red-500 dark:hover:text-red-400 h-8 w-8" title="Eliminar">
                <Trash2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-100 dark:bg-slate-800 border-red-500 text-slate-800 dark:text-white">
              <DialogHeader>
                <DialogTitle className="text-xl text-red-600 dark:text-red-400 flex items-center"><AlertTriangle className="h-6 w-6 mr-2 text-yellow-500 dark:text-yellow-400"/>Confirmar Eliminación</DialogTitle>
                <DialogDescription className="text-slate-600 dark:text-slate-300">
                  ¿Estás seguro de que quieres eliminar la orden de servicio para <span className="font-semibold text-red-600 dark:text-red-400">{order.client_name}</span>? Esta acción no se puede deshacer.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => document.querySelector('[data-state="open"] [aria-label="Close"]')?.click()} className="text-slate-700 dark:text-slate-300 border-slate-400 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700">Cancelar</Button>
                <Button variant="destructive" onClick={() => onDeleteOrder(order.id)} className="bg-red-600 hover:bg-red-700">Eliminar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </motion.div>
  );
};

export default React.memo(ServiceOrderCard);
