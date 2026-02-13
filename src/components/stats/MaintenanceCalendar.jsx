import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, PlusCircle, Trash2, Edit } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format, parseISO, getMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const AddMaintenanceModal = ({ isOpen, onClose, onSave, clients, existingMaintenance }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [clientId, setClientId] = useState('');
    const [maintenanceDate, setMaintenanceDate] = useState('');
    const [maintenanceType, setMaintenanceType] = useState('Mensual');

    useEffect(() => {
        if (existingMaintenance) {
            setTitle(existingMaintenance.title || '');
            setDescription(existingMaintenance.description || '');
            setClientId(existingMaintenance.client_id || '');
            setMaintenanceDate(existingMaintenance.maintenance_date ? format(parseISO(existingMaintenance.maintenance_date), 'yyyy-MM-dd') : '');
            setMaintenanceType(existingMaintenance.maintenance_type || 'Mensual');
        } else {
            setTitle('');
            setDescription('');
            setClientId('');
            setMaintenanceDate('');
            setMaintenanceType('Mensual');
        }
    }, [existingMaintenance, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !maintenanceDate || !clientId) {
            toast({ title: "Error de validación", description: "Cliente, título y fecha son obligatorios.", variant: "destructive" });
            return;
        }
        const selectedClient = clients.find(c => c.id === clientId);
        const payload = {
            title,
            description,
            client_id: clientId,
            client_name: selectedClient?.name,
            maintenance_date: maintenanceDate,
            maintenance_type: maintenanceType,
            status: 'Pendiente',
        };
        await onSave(payload, existingMaintenance?.id);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white dark:bg-slate-800">
                <DialogHeader>
                    <DialogTitle>{existingMaintenance ? 'Editar' : 'Programar'} Mantenimiento</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                     <div>
                        <Label htmlFor="client-select">Cliente *</Label>
                        <Select value={clientId} onValueChange={setClientId}>
                            <SelectTrigger id="client-select">
                                <SelectValue placeholder="Seleccionar cliente" />
                            </SelectTrigger>
                            <SelectContent>
                                {clients.map(client => <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="title">Título *</Label>
                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="maintenance-date">Fecha *</Label>
                        <Input id="maintenance-date" type="date" value={maintenanceDate} onChange={(e) => setMaintenanceDate(e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="maintenance-type">Tipo</Label>
                        <Select value={maintenanceType} onValueChange={setMaintenanceType}>
                            <SelectTrigger id="maintenance-type">
                                <SelectValue placeholder="Tipo de mantenimiento" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Mensual">Mensual</SelectItem>
                                <SelectItem value="Anual">Anual</SelectItem>
                                <SelectItem value="Correctivo">Correctivo</SelectItem>
                                <SelectItem value="Otro">Otro</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div>
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>
                </form>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSubmit}>{existingMaintenance ? 'Guardar Cambios' : 'Programar'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const MaintenanceCalendar = ({ clients }) => {
    const [maintenanceSchedule, setMaintenanceSchedule] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMaintenance, setEditingMaintenance] = useState(null);

    const fetchMaintenanceSchedule = useCallback(async () => {
        const { data, error } = await supabase
            .from('maintenance_schedule')
            .select('*')
            .order('maintenance_date', { ascending: true });

        if (error) {
            toast({ title: "Error", description: "No se pudo cargar el calendario de mantenimiento.", variant: "destructive" });
        } else {
            setMaintenanceSchedule(data || []);
        }
    }, []);

    useEffect(() => {
        fetchMaintenanceSchedule();
        const channel = supabase.channel('maintenance-schedule-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'maintenance_schedule' }, () => {
                fetchMaintenanceSchedule();
            }).subscribe();
        return () => supabase.removeChannel(channel);
    }, [fetchMaintenanceSchedule]);

    const handleSaveMaintenance = async (payload, id) => {
        if (id) {
            const { error } = await supabase.from('maintenance_schedule').update(payload).eq('id', id);
            if (error) toast({ title: "Error", description: "No se pudo actualizar.", variant: "destructive" });
            else toast({ title: "Éxito", description: "Mantenimiento actualizado." });
        } else {
            const { error } = await supabase.from('maintenance_schedule').insert([payload]);
            if (error) toast({ title: "Error", description: "No se pudo programar.", variant: "destructive" });
            else toast({ title: "Éxito", description: "Mantenimiento programado." });
        }
    };
    
    const handleDeleteMaintenance = async (id) => {
        const { error } = await supabase.from('maintenance_schedule').delete().eq('id', id);
        if (error) toast({ title: "Error", description: "No se pudo eliminar.", variant: "destructive" });
        else toast({ title: "Éxito", description: "Mantenimiento eliminado." });
    };

    const DayWithEvents = ({ date, displayMonth }) => {
        const isCurrentMonth = getMonth(date) === getMonth(displayMonth);
        const dateKey = format(date, 'yyyy-MM-dd');
        const hasEvent = maintenanceSchedule.some(event => event.maintenance_date === dateKey && event.status === 'Pendiente');
        return (
            <div className={`relative p-1 text-xs ${!isCurrentMonth ? 'text-slate-400 dark:text-slate-600' : ''}`}>
                {date.getDate()}
                {hasEvent && isCurrentMonth && <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-purple-500 rounded-full"></span>}
            </div>
        );
    };

    return (
        <motion.div className="bg-white dark:bg-slate-800/60 p-4 rounded-xl shadow-lg border border-purple-500/20 h-full">
            <AddMaintenanceModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingMaintenance(null); }}
                onSave={handleSaveMaintenance}
                clients={clients}
                existingMaintenance={editingMaintenance}
            />
            <header className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-purple-700 dark:text-purple-300 flex items-center">
                    <CalendarDays className="h-6 w-6 mr-3 text-purple-500" /> Calendario
                </h2>
                <Button size="sm" onClick={() => { setEditingMaintenance(null); setIsModalOpen(true); }} className="bg-purple-600 hover:bg-purple-700 text-white">
                    <PlusCircle className="mr-2 h-4 w-4" /> Programar
                </Button>
            </header>
            <div className="flex justify-center">
                <DayPicker
                    mode="single"
                    locale={es}
                    components={{ Day: DayWithEvents }}
                    styles={{
                        root: { transform: 'scale(0.85)', transformOrigin: 'top center' },
                    }}
                />
            </div>
             <div className="mt-2 space-y-2 max-h-48 overflow-y-auto styled-scrollbar pr-2">
                <h3 className="text-md font-semibold text-slate-700 dark:text-slate-200 sticky top-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm py-1">Próximos Mantenimientos</h3>
                {maintenanceSchedule.filter(m => m.status === 'Pendiente' && parseISO(m.maintenance_date) >= new Date()).map(m => (
                    <div key={m.id} className="flex items-center justify-between p-2 bg-slate-100 dark:bg-slate-700/50 rounded-md text-xs">
                        <div>
                            <p className="font-bold">{m.client_name}</p>
                            <p className="text-slate-600 dark:text-slate-400">{format(parseISO(m.maintenance_date), 'dd/MM/yy', { locale: es })} - {m.title}</p>
                        </div>
                        <div className="flex items-center">
                            <Button size="icon" variant="ghost" className="h-6 w-6 text-sky-500" onClick={() => { setEditingMaintenance(m); setIsModalOpen(true);}}><Edit className="h-3 w-3"/></Button>
                            <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500" onClick={() => handleDeleteMaintenance(m.id)}><Trash2 className="h-3 w-3"/></Button>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

export default MaintenanceCalendar;