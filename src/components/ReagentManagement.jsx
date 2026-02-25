import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, PlusCircle, Edit, Trash2, Search, Filter, AlertTriangle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ReagentDeliveryForm from '@/components/ReagentDeliveryForm';
import ReagentStats from '@/components/ReagentStats';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/lib/supabaseClient';
import { isMobile } from '@/lib/orderUtils';

const ReagentManagement = ({ clients: propClients, deliveries, fetchDeliveries }) => {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [clientFilter, setClientFilter] = useState('Todos');
  const [monthFilter, setMonthFilter] = useState('Todos');
  const [clientsList, setClientsList] = useState(propClients || []);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setClientsList(propClients || []);
    if (deliveries) {
      setLoading(false);
    }
  }, [propClients, deliveries]);

  const handleOpenNewDeliveryModal = () => {
    setEditingDelivery(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditDeliveryModal = (delivery) => {
    setEditingDelivery(delivery);
    setIsFormModalOpen(true);
  };

  const handleSaveDelivery = async (deliveryData) => {
    const isUpdate = !!deliveryData.id && deliveries.some(d => d.id === deliveryData.id);
    
    const { error } = isUpdate
      ? await supabase.from('reagent_deliveries').update(deliveryData).match({ id: deliveryData.id })
      : await supabase.from('reagent_deliveries').insert([deliveryData]);

    if (error) {
      toast({ title: `Error al ${isUpdate ? 'actualizar' : 'registrar'} entrega`, description: error.message, variant: "destructive" });
      return;
    }
    
    toast({ title: "¡Éxito! 🚀", description: `Entrega ${isUpdate ? 'actualizada' : 'registrada'} correctamente.` });

    setIsFormModalOpen(false);
    setEditingDelivery(null);

    if (typeof fetchDeliveries === 'function') {
      fetchDeliveries();
    }
  };

  const handleDeleteDelivery = async (deliveryId) => {
    const { error } = await supabase
      .from('reagent_deliveries')
      .delete()
      .match({ id: deliveryId });

    if (error) {
      toast({ title: "Error al eliminar entrega", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: "Entrega Eliminada",
        description: `La entrega de reactivo ha sido eliminada.`,
        variant: "destructive",
      });
    }
    if (typeof fetchDeliveries === 'function') {
      fetchDeliveries();
    }
  };
  
  const sortedDeliveries = useMemo(() => {
    if (!deliveries) return [];
    return [...deliveries].sort((a, b) => new Date(b.delivery_date) - new Date(a.delivery_date));
  }, [deliveries]);

  const monthOptions = useMemo(() => {
    const months = new Set();
    (deliveries || []).forEach(d => {
      if (d.delivery_date) {
        months.add(format(parseISO(d.delivery_date), 'yyyy-MM'));
      }
    });
    return Array.from(months).sort().reverse().map(monthStr => ({
      value: monthStr,
      label: format(parseISO(`${monthStr}-01`), 'MMMM yyyy', { locale: es }),
    }));
  }, [deliveries]);
  
  const filteredDeliveries = useMemo(() => {
    return (sortedDeliveries || []).filter(delivery => {
      const deliveryItemsString = (delivery.delivery_items || [])
        .map(item => `${item.reagent_name} ${item.reagent_size}`)
        .join(' ')
        .toLowerCase();

      const matchesSearchTerm = 
        (delivery.client_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        deliveryItemsString.includes(searchTerm.toLowerCase());
      
      const matchesClient = clientFilter === 'Todos' || delivery.client_name === clientFilter;
      
      const matchesMonth = monthFilter === 'Todos' || (delivery.delivery_date && format(parseISO(delivery.delivery_date), 'yyyy-MM') === monthFilter);

      return matchesSearchTerm && matchesClient && matchesMonth;
    });
  }, [sortedDeliveries, searchTerm, clientFilter, monthFilter]);

  return (
    <div className="p-2 sm:p-4 md:p-6">
      <header className="mb-6">
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row justify-between items-center mb-4 pb-4 border-b border-teal-500/30"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-500 via-cyan-500 to-sky-500 pb-2">
            Reactivos <Droplets className="inline-block h-7 sm:h-9 w-7 sm:w-9 ml-2 animate-bounce" />
          </h1>
           <Button 
              onClick={handleOpenNewDeliveryModal}
              size={isMobile() ? 'sm' : 'default'}
              className="mt-3 sm:mt-0 w-full sm:w-auto bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1">
                 <PlusCircle className="mr-2 h-4 w-4" /> Registrar Entrega
            </Button>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4"
        >
          <div className="relative">
            <Input 
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800/70 border-teal-500/50 placeholder-gray-500 dark:placeholder-gray-400 text-slate-800 dark:text-white rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-cyan-500 focus:border-cyan-500 h-9"
            />
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          </div>
          <div>
            <Select value={clientFilter} onValueChange={setClientFilter}>
              <SelectTrigger className="w-full bg-slate-100 dark:bg-slate-800/70 border-teal-500/50 text-slate-800 dark:text-white rounded-lg text-sm focus:ring-cyan-500 focus:border-cyan-500 h-9">
                <Filter className="inline-block h-3 w-3 mr-1 text-gray-400 dark:text-gray-500" />
                <SelectValue placeholder="Filtrar por Cliente" />
              </SelectTrigger>
              <SelectContent className="bg-slate-100 dark:bg-slate-800 border-teal-500/50 text-slate-800 dark:text-white">
                <SelectItem value="Todos">Todos los Clientes</SelectItem>
                {clientsList.map(client => <SelectItem key={client.id} value={client.name}>{client.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-full bg-slate-100 dark:bg-slate-800/70 border-teal-500/50 text-slate-800 dark:text-white rounded-lg text-sm focus:ring-cyan-500 focus:border-cyan-500 h-9">
                <Calendar className="inline-block h-3 w-3 mr-1 text-gray-400 dark:text-gray-500" />
                <SelectValue placeholder="Filtrar por Mes" />
              </SelectTrigger>
              <SelectContent className="bg-slate-100 dark:bg-slate-800 border-teal-500/50 text-slate-800 dark:text-white">
                <SelectItem value="Todos">Todos los Meses</SelectItem>
                {monthOptions.map(month => <SelectItem key={month.value} value={month.value} className="capitalize">{month.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </motion.div>
      </header>
      
      <ReagentDeliveryForm
        isOpen={isFormModalOpen}
        onClose={() => { setIsFormModalOpen(false); setEditingDelivery(null); }}
        onSave={handleSaveDelivery}
        existingDelivery={editingDelivery}
        clients={clientsList}
      />
      
      <motion.div 
        layout 
        className="bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-md shadow-2xl rounded-xl p-2 md:p-6 border border-teal-500/30"
      >
        {loading && <div className="text-center py-10 text-lg text-teal-500">Cargando entregas...</div>}
        {!loading && filteredDeliveries.length > 0 ? (
          isMobile() ? (
            <div className="space-y-3">
              {filteredDeliveries.map((delivery, index) => (
                 <motion.div
                    key={delivery.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-slate-200/60 dark:bg-slate-700/60 p-3 rounded-lg shadow-sm border border-teal-500/20"
                 >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-teal-700 dark:text-teal-300 text-sm truncate max-w-[180px]">{delivery.client_name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{delivery.delivery_date ? format(parseISO(delivery.delivery_date), 'dd/MM/yy', { locale: es }) : 'N/A'}</p>
                    </div>
                    <ul className="text-xs text-slate-600 dark:text-slate-400 mb-2 list-disc list-inside">
                      {(delivery.delivery_items || []).map((item, idx) => (
                        <li key={idx} className={`${item.is_pending ? 'text-amber-500 font-medium' : ''} truncate`}>
                          {item.quantity} x {item.reagent_name} ({item.reagent_size}) {item.is_pending ? '(P)' : ''}
                        </li>
                      ))}
                    </ul>
                    <div className="flex justify-end space-x-1 mt-1">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEditDeliveryModal(delivery)} className="text-amber-500 hover:text-amber-400 dark:text-yellow-400 dark:hover:text-yellow-300 h-8 w-8">
                          <Edit className="h-4 w-4" />
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
                              ¿Estás seguro de que quieres eliminar esta entrega para <span className="font-semibold text-red-600 dark:text-red-400">{delivery.client_name}</span>?
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter className="mt-4">
                            <Button variant="outline" onClick={() => document.querySelector('[data-state="open"] [aria-label="Close"]')?.click()}>Cancelar</Button>
                            <Button variant="destructive" onClick={() => handleDeleteDelivery(delivery.id)}>Eliminar</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                 </motion.div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-teal-500/30 hover:bg-slate-200/50 dark:hover:bg-slate-700/30">
                  <TableHead className="text-teal-700 dark:text-teal-300 font-semibold">Cliente</TableHead>
                  <TableHead className="text-teal-700 dark:text-teal-300 font-semibold">Ítems Entregados</TableHead>
                  <TableHead className="text-teal-700 dark:text-teal-300 font-semibold hidden lg:table-cell">Fecha Entrega</TableHead>
                  <TableHead className="text-right text-teal-700 dark:text-teal-300 font-semibold">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filteredDeliveries.map((delivery, index) => (
                    <motion.tr 
                      key={delivery.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-200/70 dark:hover:bg-slate-700/50 transition-colors duration-200"
                    >
                      <TableCell className="py-4 text-slate-700 font-semibold dark:text-slate-300">{delivery.client_name}</TableCell>
                      <TableCell className="py-4 text-slate-700 dark:text-slate-300 text-xs">
                        <ul>
                          {(delivery.delivery_items || []).map((item, idx) => (
                             <li key={idx} className={item.is_pending ? 'text-amber-500' : ''}>
                              {item.quantity} x {item.reagent_name} ({item.reagent_size}) {item.is_pending ? '(PENDIENTE)' : ''}
                            </li>
                          ))}
                        </ul>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell py-4 text-slate-700 dark:text-slate-300">
                        {delivery.delivery_date ? format(parseISO(delivery.delivery_date), 'dd/MM/yyyy', { locale: es }) : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right py-4">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEditDeliveryModal(delivery)} className="text-amber-500 hover:text-amber-400 dark:text-yellow-400 dark:hover:text-yellow-300 mr-1">
                          <Edit className="h-5 w-5" />
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
                                ¿Estás seguro de que quieres eliminar esta entrega para <span className="font-semibold text-red-600 dark:text-red-400">{delivery.client_name}</span>?
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="mt-4">
                              <Button variant="outline" onClick={() => document.querySelector('[data-state="open"] [aria-label="Close"]')?.click()}>Cancelar</Button>
                              <Button variant="destructive" onClick={() => handleDeleteDelivery(delivery.id)}>Eliminar</Button>
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
          !loading && <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <Search className="h-16 w-16 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-300 mb-2">No se encontraron entregas</h3>
            <p className="text-slate-500 dark:text-slate-400">Intenta ajustar tus filtros o registra una nueva entrega.</p>
          </motion.div>
        )}
      </motion.div>
      <ReagentStats deliveries={deliveries} clients={clientsList} />
    </div>
  );
};

export default ReagentManagement;