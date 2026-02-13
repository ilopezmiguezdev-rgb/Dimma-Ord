import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Filter, Edit, CheckSquare, XSquare, CalendarPlus, PlusCircle, Eye } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toaster";
import { supabase } from '@/lib/supabaseClient';
import { format, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

const ReminderFormModal = ({ isOpen, onClose, onSave, clients, existingReminder, equipment }) => {
  const [description, setDescription] = useState('');
  const [clientId, setClientId] = useState('');
  const [equipmentId, setEquipmentId] = useState('');
  const [clientEquipment, setClientEquipment] = useState([]);
  const [dueDate, setDueDate] = useState('');
  const [reminderType, setReminderType] = useState('Visita');
  const [status, setStatus] = useState('Pendiente');

  const reminderTypes = ["Visita", "Service", "Entrega de reactivo", "Instalacion", "Falta de repuesto"];

  useEffect(() => {
    if (existingReminder) {
      setDescription(existingReminder.description || '');
      setClientId(existingReminder.client_id || 'none');
      setEquipmentId(existingReminder.equipment_id || 'none');
      setDueDate(existingReminder.due_date ? format(parseISO(existingReminder.due_date), 'yyyy-MM-dd') : '');
      setReminderType(existingReminder.reminder_type || 'Visita');
      setStatus(existingReminder.status || 'Pendiente');
    } else {
      setDescription('');
      setClientId('none');
      setEquipmentId('none');
      setDueDate('');
      setReminderType('Visita');
      setStatus('Pendiente');
    }
  }, [existingReminder, isOpen]);
  
  useEffect(() => {
    if(clientId && equipment) {
        setClientEquipment(equipment.filter(e => e.client_id === clientId));
    } else {
        setClientEquipment([]);
    }
    if(!existingReminder) setEquipmentId('none');
  }, [clientId, equipment, existingReminder]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      toast({ title: "Error", description: "La descripción es obligatoria.", variant: "destructive" });
      return;
    }
    const selectedClient = clients.find(c => c.id === clientId);
    const payload = {
      description,
      client_id: clientId === 'none' ? null : clientId,
      client_name: selectedClient ? selectedClient.name : null,
      equipment_id: equipmentId === 'none' ? null : equipmentId,
      due_date: dueDate || null,
      reminder_type: reminderType,
      status,
    };
    await onSave(payload, existingReminder ? existingReminder.id : null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-slate-100 dark:bg-slate-800 border-orange-500 text-slate-800 dark:text-white">
        <DialogHeader>
          <DialogTitle className="text-xl text-orange-600 dark:text-orange-400">
            {existingReminder ? 'Editar Alerta' : 'Agregar Alerta'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="py-4 space-y-4">
          <div>
            <Label htmlFor="reminder_type_select">Tipo de Alerta</Label>
            <Select value={reminderType} onValueChange={setReminderType}>
              <SelectTrigger><SelectValue/></SelectTrigger>
              <SelectContent>
                {reminderTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
           <div>
            <Label htmlFor="reminder_description">Descripción *</Label>
            <Textarea id="reminder_description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} required />
          </div>
          <div>
            <Label htmlFor="reminder_client">Cliente (Opcional)</Label>
            <Select value={clientId || 'none'} onValueChange={setClientId}>
              <SelectTrigger><SelectValue placeholder="Seleccionar cliente" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Ninguno</SelectItem>
                {clients.map(client => (<SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          {clientId !== 'none' && (
             <div>
                <Label htmlFor="reminder_equipment">Equipo (Opcional)</Label>
                <Select value={equipmentId || 'none'} onValueChange={setEquipmentId} disabled={clientEquipment.length === 0}>
                  <SelectTrigger><SelectValue placeholder={clientEquipment.length > 0 ? "Seleccionar equipo" : "Cliente sin equipos"} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguno</SelectItem>
                    {clientEquipment.map(e => (
                        <SelectItem key={e.id} value={e.id}>{e.equipment_models.model_name} (S/N: {e.serial_number})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
          )}
          <div>
            <Label htmlFor="reminder_due_date">Fecha Límite (Opcional)</Label>
            <Input type="date" id="reminder_due_date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="reminder_status">Estado</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Pendiente">Pendiente</SelectItem>
                <SelectItem value="Completado">Completado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit">Guardar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};


const RemindersPage = ({ clients, equipment }) => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('Pendiente');
  const [typeFilter, setTypeFilter] = useState('Todos');
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const navigate = useNavigate();
  
  const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 768;
  const reminderTypes = ["Visita", "Service", "Entrega de reactivo", "Instalacion", "Falta de repuesto"];

  const fetchReminders = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('reminders').select(`
      *,
      equipment_inventory (
        id,
        serial_number,
        equipment_models (
            model_name
        )
      )
    `).order('due_date', { ascending: true, nullsLast: true }).order('created_at', { ascending: false });
    if (error) {
      toast({ title: "Error", description: "No se pudieron cargar los recordatorios.", variant: "destructive" });
      setReminders([]);
    } else {
      setReminders(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchReminders();
    const channel = supabase.channel('reminders_realtime_page').on('postgres_changes', { event: '*', schema: 'public', table: 'reminders' }, () => fetchReminders()).subscribe();
    return () => supabase.removeChannel(channel);
  }, [fetchReminders]);

  const handleSaveReminder = async (reminderData, reminderId) => {
    // If it's a reagent delivery, create a pending delivery order instead
    if (reminderData.reminder_type === 'Entrega de reactivo') {
      const pendingDelivery = {
        client_id: reminderData.client_id,
        client_name: reminderData.client_name,
        requested_items: [{ reagent_name: reminderData.description, reagent_size: 'N/A', quantity: 1 }],
        notes: `Generado desde alerta: ${reminderData.description}`,
        status: 'Pendiente',
        requested_date: new Date().toISOString().split('T')[0],
        target_delivery_date: reminderData.due_date,
      };
      
      const { error } = await supabase.from('pending_reagent_deliveries').insert([pendingDelivery]);
      if (error) {
        toast({ title: "Error", description: `No se pudo crear la orden de entrega. ${error.message}`, variant: "destructive" });
      } else {
        toast({ title: "Éxito", description: "Orden de Entrega creada en 'Entregas Pendientes'." });
        // If it was an existing reminder being edited to a reagent delivery, delete the old reminder
        if(reminderId) await handleDeleteReminder(reminderId);
      }
      return;
    }

    const request = reminderId ? supabase.from('reminders').update(reminderData).eq('id', reminderId) : supabase.from('reminders').insert([reminderData]);
    const { error } = await request;
    if (error) toast({ title: "Error", description: `No se pudo guardar el recordatorio. ${error.message}`, variant: "destructive" });
    else toast({ title: "Éxito", description: `Recordatorio ${reminderId ? 'actualizado' : 'creado'}.` });
    fetchReminders();
  };
  
  const updateReminderStatus = async (id, status) => {
     const { error } = await supabase.from('reminders').update({ status }).eq('id', id);
    if (error) toast({ title: "Error", description: "No se pudo actualizar el estado.", variant: "destructive" });
    else toast({ title: "Éxito", description: `Estado actualizado.` });
  };

  const handleDeleteReminder = async (id) => {
    const { error } = await supabase.from('reminders').delete().eq('id', id);
    if (error) toast({ title: "Error", description: "No se pudo eliminar.", variant: "destructive" });
    else toast({ title: "Éxito", description: "Recordatorio eliminado." });
  };
  
  const handleViewOrders = (serialNumber) => {
    navigate(`/?equipment_serial=${encodeURIComponent(serialNumber)}`);
  };

  const filteredReminders = reminders.filter(r => (statusFilter === 'Todos' || r.status === statusFilter) && (typeFilter === 'Todos' || r.reminder_type === typeFilter));

  const getStatusBadgeColor = (s) => (s === 'Pendiente' ? 'bg-amber-500' : 'bg-emerald-500');
  const getTypeBadgeColor = (t) => ({ 'Visita': 'bg-indigo-500', 'Service': 'bg-sky-500', 'Entrega de reactivo': 'bg-teal-500', 'Instalacion': 'bg-cyan-500', 'Falta de repuesto': 'bg-red-500' }[t] || 'bg-slate-400');

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="p-2 sm:p-4 md:p-6 bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-md shadow-2xl rounded-xl border border-orange-500/30">
      <header className="mb-6 pb-4 border-b border-orange-500/30 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div className="mb-3 sm:mb-0">
          <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-yellow-500 pb-1 flex items-center">
            <AlertCircle className="h-7 w-7 mr-2" /> Alertas y Recordatorios
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Gestiona tus tareas y pendientes.</p>
        </div>
        <Button size={isMobile() ? 'sm' : 'default'} onClick={() => { setSelectedReminder(null); setIsFormModalOpen(true); }} className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white">
          <PlusCircle className="mr-2 h-4 w-4" /> Agregar
        </Button>
      </header>

      <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 text-xs"><Filter className="h-3 w-3 mr-1"/><span>Estado: {statusFilter}</span></SelectTrigger>
          <SelectContent><SelectItem value="Todos">Todos</SelectItem><SelectItem value="Pendiente">Pendiente</SelectItem><SelectItem value="Completado">Completado</SelectItem></SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
           <SelectTrigger className="h-9 text-xs"><Filter className="h-3 w-3 mr-1"/><span>Tipo: {typeFilter}</span></SelectTrigger>
           <SelectContent>
                <SelectItem value="Todos">Todos</SelectItem>
                {reminderTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
            </SelectContent>
        </Select>
      </div>

      {loading && <p className="text-center py-8 text-orange-500">Cargando...</p>}
      {!loading && filteredReminders.length === 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
          <CalendarPlus className="h-16 w-16 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300">No hay alertas.</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">¡Todo al día o crea una nueva!</p>
        </motion.div>
      )}

      {!loading && filteredReminders.length > 0 && (
         isMobile() ? (
            <div className="space-y-3">
              {filteredReminders.map((r) => (
                <div key={r.id} className="bg-slate-200/60 dark:bg-slate-700/60 p-3 rounded-lg shadow-sm border-l-4" style={{ borderColor: getTypeBadgeColor(r.reminder_type).replace('bg-', 'var(--color-') }}>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100 mb-1">{r.description}</p>
                  <p className="text-xs text-orange-600 dark:text-orange-400 font-semibold">{r.client_name || 'General'}</p>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-2">
                      <Badge className={`${getTypeBadgeColor(r.reminder_type)} text-white text-xs`}>{r.reminder_type}</Badge>
                      <Badge className={`${getStatusBadgeColor(r.status)} text-white text-xs`}>{r.status}</Badge>
                    </div>
                    <div className="flex items-center">
                      {r.equipment_inventory && <Button variant="ghost" size="icon" onClick={() => handleViewOrders(r.equipment_inventory.serial_number)} className="h-7 w-7 text-blue-500"><Eye className="h-4 w-4" /></Button>}
                      <Button variant="ghost" size="icon" onClick={() => { setSelectedReminder(r); setIsFormModalOpen(true); }} className="h-7 w-7 text-sky-500"><Edit className="h-4 w-4" /></Button>
                      {r.status === 'Pendiente' && <Button variant="ghost" size="icon" onClick={() => updateReminderStatus(r.id, 'Completado')} className="h-7 w-7 text-emerald-500"><CheckSquare className="h-4 w-4" /></Button>}
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteReminder(r.id)} className="h-7 w-7 text-red-500"><XSquare className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
         ) : (
          <div className="overflow-x-auto styled-scrollbar rounded-lg border dark:border-slate-700 shadow-md">
            <Table className="min-w-full bg-white dark:bg-slate-800">
              <TableHeader className="bg-slate-50 dark:bg-slate-700/50">
                <TableRow>
                  <TableHead className="px-3 py-2 text-xs">Descripción</TableHead>
                  <TableHead className="px-3 py-2 text-xs">Cliente / Equipo</TableHead>
                  <TableHead className="px-3 py-2 text-xs">Tipo</TableHead>
                  <TableHead className="px-3 py-2 text-xs">Fecha Límite</TableHead>
                  <TableHead className="px-3 py-2 text-xs">Estado</TableHead>
                  <TableHead className="px-3 py-2 text-xs text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredReminders.map((r) => (
                  <TableRow key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <TableCell className="px-3 py-2 text-sm max-w-xs truncate">{r.description}</TableCell>
                    <TableCell className="px-3 py-2 text-sm">
                      <div>{r.client_name || '-'}</div>
                      {r.equipment_inventory && <div className="text-xs text-slate-500">{r.equipment_inventory.equipment_models.model_name} (S/N: {r.equipment_inventory.serial_number})</div>}
                    </TableCell>
                    <TableCell className="px-3 py-2"><Badge className={`${getTypeBadgeColor(r.reminder_type)} text-white text-xs`}>{r.reminder_type}</Badge></TableCell>
                    <TableCell className="px-3 py-2 text-sm">{r.due_date && isValid(parseISO(r.due_date)) ? format(parseISO(r.due_date), 'dd/MM/yy') : 'N/A'}</TableCell>
                    <TableCell className="px-3 py-2"><Badge className={`${getStatusBadgeColor(r.status)} text-white`}>{r.status}</Badge></TableCell>
                    <TableCell className="px-3 py-2 text-right space-x-0">
                      {r.equipment_inventory && <Button variant="ghost" size="icon" onClick={() => handleViewOrders(r.equipment_inventory.serial_number)} className="h-7 w-7 text-blue-500"><Eye className="h-4 w-4" /></Button>}
                      <Button variant="ghost" size="icon" onClick={() => { setSelectedReminder(r); setIsFormModalOpen(true); }} className="h-7 w-7 text-sky-500"><Edit className="h-4 w-4" /></Button>
                      {r.status === 'Pendiente' && <Button variant="ghost" size="icon" onClick={() => updateReminderStatus(r.id, 'Completado')} className="h-7 w-7 text-emerald-500"><CheckSquare className="h-4 w-4" /></Button>}
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteReminder(r.id)} className="h-7 w-7 text-red-500"><XSquare className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )
      )}
      <ReminderFormModal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} onSave={handleSaveReminder} clients={clients} existingReminder={selectedReminder} equipment={equipment}/>
    </motion.div>
  );
};

export default RemindersPage;