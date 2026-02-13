import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Trash2, Eye, User, Package, Search, AlertTriangle, Paperclip, Calendar, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const getStatusColor = (status) => {
  switch (status) {
    case 'Pendiente': return 'bg-amber-500 hover:bg-amber-600';
    case 'En Progreso': return 'bg-sky-500 hover:bg-sky-600';
    case 'Completada': return 'bg-emerald-500 hover:bg-emerald-600';
    case 'Facturado': return 'bg-green-600 hover:bg-green-700';
    case 'Cancelado': return 'bg-red-500 hover:bg-red-600';
    default: return 'bg-slate-500 hover:bg-slate-600';
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'Alta': return 'border-red-500 text-red-500 dark:border-red-400 dark:text-red-400';
    case 'Media': return 'border-amber-500 text-amber-500 dark:border-amber-400 dark:text-amber-400';
    case 'Baja': return 'border-emerald-500 text-emerald-500 dark:border-emerald-400 dark:text-emerald-400';
    default: return 'border-slate-400 text-slate-400 dark:border-slate-500 dark:text-slate-500';
  }
};

const ServiceOrderTable = ({ orders, onEditOrder, onDeleteOrder, onViewDetails, onOpenAttachmentModal }) => {
  const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <motion.div 
      layout 
      className="bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-md shadow-2xl rounded-xl p-2 md:p-6 border border-sky-500/30"
    >
      {orders.length > 0 ? (
        isMobile() ? (
          <div className="space-y-3">
            <AnimatePresence>
              {orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-slate-200/60 dark:bg-slate-700/60 p-3 rounded-lg shadow-sm border border-sky-500/20"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-semibold text-sky-700 dark:text-sky-300 text-sm truncate max-w-[150px]">{order.client_name}</span>
                       {order.sub_client_name && (
                         <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[150px]">{order.sub_client_name}</p>
                       )}
                    </div>
                    <Badge className={`${getStatusColor(order.status)} text-xs text-white px-2 py-0.5`}>{order.status}</Badge>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                    <p>Equipo: {order.equipment_type}</p>
                    <p>Fecha: {order.creation_date ? format(parseISO(order.creation_date), 'dd/MM/yy', { locale: es }) : 'N/A'}</p>
                    <p>Prioridad: <span className={`${getPriorityColor(order.priority).split(' ')[1]} ${getPriorityColor(order.priority).split(' ')[2]}`}>{order.priority}</span></p>
                  </div>
                  <div className="flex justify-end space-x-1 mt-1">
                    <Button variant="ghost" size="icon" onClick={() => onViewDetails(order)} className="text-sky-600 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300 h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onEditOrder(order)} className="text-amber-500 hover:text-amber-400 dark:text-yellow-400 dark:hover:text-yellow-300 h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onOpenAttachmentModal(order)} className="text-indigo-500 hover:text-indigo-400 dark:text-indigo-400 dark:hover:text-indigo-300 h-8 w-8" title="Adjuntar archivo">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                     <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-500 dark:text-red-500 dark:hover:text-red-400 h-8 w-8">
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
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-b border-sky-500/30 hover:bg-slate-200/50 dark:hover:bg-slate-700/30">
                <TableHead className="text-sky-700 dark:text-sky-300 font-semibold"><User className="inline h-4 w-4 mr-1"/>Cliente / Laboratorio</TableHead>
                <TableHead className="text-sky-700 dark:text-sky-300 font-semibold hidden sm:table-cell"><Calendar className="inline h-4 w-4 mr-1"/>Fecha</TableHead>
                <TableHead className="text-sky-700 dark:text-sky-300 font-semibold hidden md:table-cell"><Package className="inline h-4 w-4 mr-1"/>Equipo</TableHead>
                <TableHead className="text-sky-700 dark:text-sky-300 font-semibold text-center">Estado</TableHead>
                <TableHead className="text-sky-700 dark:text-sky-300 font-semibold hidden md:table-cell text-center">Prioridad</TableHead>
                <TableHead className="text-right text-sky-700 dark:text-sky-300 font-semibold">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {orders.map((order, index) => (
                  <motion.tr 
                    key={order.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-200/70 dark:hover:bg-slate-700/50 transition-colors duration-200"
                  >
                    <TableCell className="py-3 text-slate-700 dark:text-slate-300">
                      <div className="font-medium">{order.client_name}</div>
                      {order.sub_client_name && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                          <Building className="h-3 w-3 mr-1.5 flex-shrink-0" />
                          {order.sub_client_name}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell py-3 text-slate-700 dark:text-slate-300">{order.creation_date ? format(parseISO(order.creation_date), 'dd/MM/yyyy', { locale: es }) : 'N/A'}</TableCell>
                    <TableCell className="hidden md:table-cell py-3 text-slate-700 dark:text-slate-300">{order.equipment_type} ({order.equipment_brand})</TableCell>
                    <TableCell className="py-3 text-center">
                      <Badge className={`${getStatusColor(order.status)} text-xs text-white px-3 py-1`}>{order.status}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell py-3 text-center">
                      <Badge variant="outline" className={`${getPriorityColor(order.priority)} text-xs px-3 py-1`}>{order.priority}</Badge>
                    </TableCell>
                    <TableCell className="text-right py-3 space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => onViewDetails(order)} className="text-sky-600 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300">
                        <Eye className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onEditOrder(order)} className="text-amber-500 hover:text-amber-400 dark:text-yellow-400 dark:hover:text-yellow-300">
                        <Edit className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onOpenAttachmentModal(order)} className="text-indigo-500 hover:text-indigo-400 dark:text-indigo-400 dark:hover:text-indigo-300" title="Adjuntar archivo">
                        <Paperclip className="h-5 w-5" />
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-500 dark:text-red-500 dark:hover:text-red-400">
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-100 dark:bg-slate-800 border-red-500 text-slate-800 dark:text-white">
                          <DialogHeader>
                            <DialogTitle className="text-xl text-red-600 dark:text-red-400 flex items-center"><AlertTriangle className="h-6 w-6 mr-2 text-yellow-500 dark:text-yellow-400"/>Confirmar Eliminación</DialogTitle>
                            <DialogDescription className="text-slate-600 dark:text-slate-300">
                              ¿Estás seguro de que quieres eliminar la orden de servicio para <span className="font-semibold text-red-600 dark:text-red-400">{order.client_name} ({order.id})</span>? Esta acción no se puede deshacer.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter className="mt-4">
                            <Button variant="outline" onClick={() => document.querySelector('[data-state="open"] [aria-label="Close"]')?.click()} className="text-slate-700 dark:text-slate-300 border-slate-400 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700">Cancelar</Button>
                            <Button variant="destructive" onClick={() => onDeleteOrder(order.id)} className="bg-red-600 hover:bg-red-700">Eliminar</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        )
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <Search className="h-16 w-16 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-300 mb-2">No se encontraron órdenes de servicio</h3>
          <p className="text-slate-500 dark:text-slate-400">Intenta ajustar tus filtros o crea una nueva orden.</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ServiceOrderTable;