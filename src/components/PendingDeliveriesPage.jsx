import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Truck, Filter, Edit, CheckSquare, XSquare, PackageX, CalendarClock, Info } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toaster";
import { supabase } from '@/lib/supabaseClient';
import { format, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';


const PendingDeliveriesPage = ({ clients }) => {
  const [pendingDeliveries, setPendingDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('Pendiente');
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ notes: '', target_delivery_date: '', status: '' });

  const fetchPendingDeliveries = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('pending_reagent_deliveries')
      .select('*')
      .order('target_delivery_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: "Error", description: "No se pudieron cargar las entregas pendientes.", variant: "destructive" });
      setPendingDeliveries([]);
    } else {
      setPendingDeliveries(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPendingDeliveries();
    const channel = supabase
      .channel('pending_reagent_deliveries_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pending_reagent_deliveries' },
        (payload) => {
          fetchPendingDeliveries();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPendingDeliveries]);

  const handleOpenEditModal = (delivery) => {
    setSelectedDelivery(delivery);
    setEditFormData({
      notes: delivery.notes || '',
      target_delivery_date: delivery.target_delivery_date ? format(parseISO(delivery.target_delivery_date), 'yyyy-MM-dd') : '',
      status: delivery.status || 'Pendiente'
    });
    setIsEditModalOpen(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleEditFormDateChange = (dateStr) => {
     setEditFormData(prev => ({ ...prev, target_delivery_date: dateStr }));
  };
  
  const handleEditFormStatusChange = (status) => {
     setEditFormData(prev => ({ ...prev, status: status }));
  };


  const handleSaveChanges = async () => {
    if (!selectedDelivery) return;
    const updates = {
      notes: editFormData.notes,
      target_delivery_date: editFormData.target_delivery_date || null,
      status: editFormData.status
    };

    const { error } = await supabase
      .from('pending_reagent_deliveries')
      .update(updates)
      .eq('id', selectedDelivery.id);

    if (error) {
      toast({ title: "Error", description: "No se pudo actualizar la entrega pendiente.", variant: "destructive" });
    } else {
      toast({ title: "Éxito", description: "Entrega pendiente actualizada." });
      setIsEditModalOpen(false);
      setSelectedDelivery(null);
      fetchPendingDeliveries();
    }
  };
  
  const updateDeliveryStatus = async (id, status) => {
     const { error } = await supabase
      .from('pending_reagent_deliveries')
      .update({ status })
      .eq('id', id);
    if (error) {
      toast({ title: "Error", description: "No se pudo actualizar el estado.", variant: "destructive" });
    } else {
      toast({ title: "Éxito", description: `Estado de entrega actualizado a ${status}.` });
      fetchPendingDeliveries();
    }
  };


  const filteredDeliveries = pendingDeliveries.filter(delivery => 
    statusFilter === 'Todas' || delivery.status === statusFilter
  );

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Pendiente': return 'bg-amber-500 hover:bg-amber-600';
      case 'En Ruta': return 'bg-sky-500 hover:bg-sky-600';
      case 'Entregado': return 'bg-emerald-500 hover:bg-emerald-600';
      case 'Cancelado': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-slate-500 hover:bg-slate-600';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 md:p-6 bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-md shadow-2xl rounded-xl border border-orange-500/30"
    >
      <header className="mb-8 pb-6 border-b border-orange-500/30">
        <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 pb-2 flex items-center">
          <Truck className="h-9 w-9 mr-3 text-orange-600 dark:text-orange-400 animate-pulse" /> Entregas de Reactivos Pendientes/Urgentes
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Gestiona las solicitudes de reactivos que requieren atención prioritaria.
        </p>
      </header>

      <div className="mb-6">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[280px] bg-white dark:bg-slate-800/70 border-orange-500/50 text-slate-800 dark:text-white rounded-lg py-3 focus:ring-red-500 focus:border-red-500">
            <Filter className="inline-block h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
            <SelectValue placeholder="Filtrar por Estado" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-slate-800 border-orange-500/50 text-slate-800 dark:text-white">
            <SelectItem value="Todas">Todos los Estados</SelectItem>
            <SelectItem value="Pendiente">Pendiente</SelectItem>
            <SelectItem value="En Ruta">En Ruta</SelectItem>
            <SelectItem value="Entregado">Entregado</SelectItem>
            <SelectItem value="Cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading && <p className="text-center py-8 text-orange-500">Cargando entregas pendientes...</p>}
      {!loading && filteredDeliveries.length === 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
          <PackageX className="h-20 w-20 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-300 mb-2">No hay entregas pendientes para el filtro seleccionado.</h3>
          <p className="text-slate-500 dark:text-slate-400">¡Todo al día por aquí!</p>
        </motion.div>
      )}

      {!loading && filteredDeliveries.length > 0 && (
        <div className="overflow-x-auto styled-scrollbar rounded-lg border dark:border-slate-700 shadow-md">
          <Table className="min-w-full bg-white dark:bg-slate-800">
            <TableHeader className="bg-slate-50 dark:bg-slate-700/50">
              <TableRow>
                <TableHead className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Cliente</TableHead>
                <TableHead className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Ítems Solicitados</TableHead>
                <TableHead className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Fecha Solicitud</TableHead>
                <TableHead className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Fecha Entrega Estimada</TableHead>
                <TableHead className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Estado</TableHead>
                <TableHead className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Notas</TableHead>
                <TableHead className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredDeliveries.map((delivery) => (
                <TableRow key={delivery.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <TableCell className="px-4 py-3 whitespace-nowrap text-sm font-medium text-orange-600 dark:text-orange-400">{delivery.client_name}</TableCell>
                  <TableCell className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                    {delivery.requested_items && delivery.requested_items.map((item, idx) => (
                      <div key={idx} className="text-xs">{item.quantity} x {item.reagent_name} ({item.reagent_size})</div>
                    ))}
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                    {delivery.requested_date && isValid(parseISO(delivery.requested_date)) ? format(parseISO(delivery.requested_date), 'dd/MM/yyyy', { locale: es }) : 'N/A'}
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                    {delivery.target_delivery_date && isValid(parseISO(delivery.target_delivery_date)) ? format(parseISO(delivery.target_delivery_date), 'dd/MM/yyyy', { locale: es }) : 'N/A'}
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-sm">
                    <Badge className={`${getStatusBadgeColor(delivery.status)} text-white`}>{delivery.status}</Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 max-w-xs truncate">{delivery.notes || '-'}</TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(delivery)} className="text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300 mr-2">
                      <Edit className="h-4 w-4" />
                    </Button>
                     {delivery.status === 'Pendiente' && (
                      <Button variant="ghost" size="icon" onClick={() => updateDeliveryStatus(delivery.id, 'En Ruta')} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mr-2" title="Marcar como En Ruta">
                        <Truck className="h-4 w-4" />
                      </Button>
                    )}
                    {delivery.status === 'En Ruta' && (
                      <Button variant="ghost" size="icon" onClick={() => updateDeliveryStatus(delivery.id, 'Entregado')} className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 mr-2" title="Marcar como Entregado">
                        <CheckSquare className="h-4 w-4" />
                      </Button>
                    )}
                    {delivery.status !== 'Cancelado' && delivery.status !== 'Entregado' && (
                       <Button variant="ghost" size="icon" onClick={() => updateDeliveryStatus(delivery.id, 'Cancelado')} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" title="Cancelar Entrega">
                        <XSquare className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {selectedDelivery && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="sm:max-w-[480px] bg-slate-100 dark:bg-slate-800 border-orange-500 text-slate-800 dark:text-white">
                <DialogHeader>
                    <DialogTitle className="text-xl text-orange-600 dark:text-orange-400">Editar Entrega Pendiente: {selectedDelivery.client_name}</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div>
                        <Label htmlFor="edit_target_delivery_date" className="text-slate-700 dark:text-slate-300">Fecha Entrega Estimada</Label>
                        <Input 
                            type="date" 
                            id="edit_target_delivery_date" 
                            name="target_delivery_date"
                            value={editFormData.target_delivery_date} 
                            onChange={(e) => handleEditFormDateChange(e.target.value)}
                            className="mt-1 bg-white dark:bg-slate-700 border-orange-300 dark:border-orange-600"
                        />
                    </div>
                    <div>
                        <Label htmlFor="edit_status" className="text-slate-700 dark:text-slate-300">Estado</Label>
                        <Select value={editFormData.status} onValueChange={handleEditFormStatusChange}>
                            <SelectTrigger className="w-full mt-1 bg-white dark:bg-slate-700 border-orange-300 dark:border-orange-600">
                                <SelectValue placeholder="Seleccionar estado" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-slate-700">
                                <SelectItem value="Pendiente">Pendiente</SelectItem>
                                <SelectItem value="En Ruta">En Ruta</SelectItem>
                                <SelectItem value="Entregado">Entregado</SelectItem>
                                <SelectItem value="Cancelado">Cancelado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="edit_notes" className="text-slate-700 dark:text-slate-300">Notas</Label>
                        <Textarea 
                            id="edit_notes" 
                            name="notes"
                            value={editFormData.notes} 
                            onChange={handleEditFormChange} 
                            className="mt-1 bg-white dark:bg-slate-700 border-orange-300 dark:border-orange-600"
                            rows={3}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancelar</Button>
                    <Button onClick={handleSaveChanges} className="bg-orange-500 hover:bg-orange-600 text-white">Guardar Cambios</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      )}
    </motion.div>
  );
};

export default PendingDeliveriesPage;