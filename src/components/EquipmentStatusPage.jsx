import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { HardDrive, Building, Info, Trash2, GripVertical, Save, X, PlusCircle, ShieldCheck, AlertTriangle, Pencil } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import AddEquipmentModal from '@/components/AddEquipmentModal';
import { Input } from '@/components/ui/input';

const getEquipmentStatus = (equipment, clientServiceOrders, clientReminders) => {
  const openServiceOrder = clientServiceOrders.find(
    so => so.equipment_serial === equipment.serial_number && (so.status === 'Pendiente' || so.status === 'En Progreso')
  );

  const pendingReminder = clientReminders.find(
    r => r.equipment_id === equipment.id && r.reminder_type === 'Faltante' && r.status === 'Pendiente'
  );

  if (openServiceOrder) {
    return { status: 'Alerta Pendiente', message: `Servicio en estado: ${openServiceOrder.status}`, color: 'orange' };
  }

  if (pendingReminder) {
    return { status: 'Alerta Pendiente', message: pendingReminder.description, color: 'orange' };
  }

  return { status: 'En Funcionamiento', message: 'El equipo está operativo.', color: 'green' };
};


const EditableField = ({ initialValue, onSave, fieldName, equipmentId, modelId, type = 'text' }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(initialValue);
    
    const handleSave = async () => {
        const tableName = fieldName === 'serial_number' || fieldName === 'installation_date' ? 'equipment_inventory' : 'equipment_models';
        const idToUpdate = tableName === 'equipment_inventory' ? equipmentId : modelId;

        const { error } = await supabase.from(tableName).update({ [fieldName]: value }).eq('id', idToUpdate);
        if (error) {
            toast({ title: "Error", description: `No se pudo actualizar.`, variant: "destructive" });
        } else {
            toast({ title: "Éxito", description: `Campo actualizado.` });
            onSave();
        }
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="flex items-center gap-1">
                <Input value={value} onChange={e => setValue(e.target.value)} type={type} className="h-7 text-xs" />
                <Button size="icon" className="h-7 w-7" onClick={handleSave}><Save className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setIsEditing(false)}><X className="h-4 w-4" /></Button>
            </div>
        );
    }

    return (
        <div onClick={() => setIsEditing(true)} className="group flex items-center justify-between hover:bg-slate-200 dark:hover:bg-slate-700 p-1 rounded cursor-pointer w-full">
            <span className="truncate">
                {fieldName.includes('date') && value ? format(parseISO(value), 'dd/MM/yy') : value || 'N/A'}
            </span>
            <Pencil className="h-3 w-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );
};


const SortableEquipmentCard = ({ equipment, onUpdate, onDelete, serviceOrders, reminders }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: equipment.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { status, message, color } = getEquipmentStatus(equipment, serviceOrders, reminders);

  const statusConfig = {
    green: {
      icon: <ShieldCheck className="h-5 w-5 text-emerald-500" />,
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      border: 'border-emerald-500/50',
      text: 'text-emerald-700 dark:text-emerald-300'
    },
    orange: {
      icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
      bg: 'bg-amber-500/10 dark:bg-amber-500/20',
      border: 'border-amber-500/50',
      text: 'text-amber-700 dark:text-amber-400'
    }
  };
  
  const currentStatus = statusConfig[color];

  return (
    <>
      <div ref={setNodeRef} style={style} className={`bg-white dark:bg-slate-800/50 rounded-lg shadow-md hover:shadow-cyan-500/20 transition-all duration-300 border ${currentStatus.border} flex flex-col ${isDragging ? 'opacity-50 shadow-2xl scale-105' : ''}`}>
        <div className="p-2 flex justify-between items-center text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700/50">
          <div className="flex items-center gap-2 overflow-hidden">
            <HardDrive className="h-4 w-4 flex-shrink-0 text-cyan-500" />
            <span className="text-sm font-bold truncate">{equipment.equipment_models.model_name}</span>
          </div>
          <div {...attributes} {...listeners} className="cursor-grab p-1"><GripVertical className="h-5 w-5" /></div>
        </div>
        <div className={`p-3 flex-grow text-xs space-y-2 ${currentStatus.bg}`}>
            <div className="flex items-center gap-2">
                {currentStatus.icon}
                <span className={`font-semibold ${currentStatus.text}`}>{status}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{message}</p>
        </div>
        <div className="p-2 bg-slate-100 dark:bg-slate-900/50 rounded-b-lg flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs"><Info className="h-3 w-3 mr-1" />+Info</Button>
            </PopoverTrigger>
            <PopoverContent className="w-60 p-3 text-xs space-y-2">
              <div><span className="font-semibold text-slate-600 dark:text-slate-300">Marca: </span><EditableField initialValue={equipment.equipment_models.brand} onSave={onUpdate} fieldName="brand" equipmentId={equipment.id} modelId={equipment.model_id} /></div>
              <div><span className="font-semibold text-slate-600 dark:text-slate-300">Modelo: </span><EditableField initialValue={equipment.equipment_models.model_name} onSave={onUpdate} fieldName="model_name" equipmentId={equipment.id} modelId={equipment.model_id}/></div>
              <div><span className="font-semibold text-slate-600 dark:text-slate-300">S/N: </span><EditableField initialValue={equipment.serial_number} onSave={onUpdate} fieldName="serial_number" equipmentId={equipment.id} modelId={equipment.model_id}/></div>
              <div><span className="font-semibold text-slate-600 dark:text-slate-300">Instalación: </span><EditableField initialValue={equipment.installation_date} onSave={onUpdate} fieldName="installation_date" equipmentId={equipment.id} modelId={equipment.model_id} type="date"/></div>
            </PopoverContent>
          </Popover>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-600" onClick={() => setDeleteDialogOpen(true)}><Trash2 className="h-4 w-4" /></Button>
        </div>
      </div>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>¿Estás seguro?</AlertDialogTitle><AlertDialogDescription>Se eliminará permanentemente el equipo <span className="font-bold">{equipment.equipment_models.model_name} (S/N: {equipment.serial_number})</span>. Esta acción no se puede deshacer.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => onDelete(equipment.id)} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const ClientEquipmentSection = ({ client, equipment, serviceOrders, reminders, onUpdate, onDelete, onClientSelect, onDeleteClient }) => {
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const clientEquipment = useMemo(() => equipment.filter(e => e.client_id === client.id), [client.id, equipment]);
  const clientServiceOrders = useMemo(() => serviceOrders.filter(so => so.client_id === client.id), [client.id, serviceOrders]);
  const clientReminders = useMemo(() => reminders.filter(r => r.client_id === client.id), [client.id, reminders]);
  
  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-slate-200/30 dark:bg-slate-900/30 p-4 rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => onClientSelect(client.id)} className="text-left text-lg font-bold text-slate-700 dark:text-slate-200 flex items-center cursor-pointer hover:text-cyan-500 transition-colors">
            <Building className="h-5 w-5 mr-3 text-cyan-500" />
            {client.name}
          </button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500/70 hover:text-red-600" onClick={() => setDeleteDialogOpen(true)}>
              <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        
        {clientEquipment.length > 0 ? (
            <SortableContext items={clientEquipment.map(e => e.id)} strategy={verticalListSortingStrategy}>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {clientEquipment.map((equip) => <SortableEquipmentCard key={equip.id} equipment={equip} onUpdate={onUpdate} onDelete={onDelete} serviceOrders={clientServiceOrders} reminders={clientReminders} />)}
              </div>
            </SortableContext>
        ) : (
            <div className="text-center text-sm text-slate-500 dark:text-slate-400 py-4">Este cliente no tiene equipos asignados.</div>
        )}
      </motion.div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle><AlertDialogDescription>Se eliminará permanentemente el cliente <span className="font-bold">{client.name}</span> y todos sus equipos asociados. Esta acción no se puede deshacer.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => onDeleteClient(client.id)} className="bg-destructive hover:bg-destructive/90">Eliminar Cliente</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const EquipmentStatusPage = ({ clients, equipment, serviceOrders, deliveries, reminders, loading, onEquipmentUpdate, onClientSelect }) => {
  const [clientEquipmentMap, setClientEquipmentMap] = useState({});
  const [isAddModalOpen, setAddModalOpen] = useState(false);

  useMemo(() => {
    const newMap = clients.reduce((acc, client) => {
      acc[client.id] = equipment.filter(e => e.client_id === client.id);
      return acc;
    }, {});
    setClientEquipmentMap(newMap);
  }, [clients, equipment]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || !active.id || !over.id || active.id === over.id) return;
    
    let overContainerId = Object.keys(clientEquipmentMap).find(key => clientEquipmentMap[key].some(item => item.id === over.id));
    
    if (!overContainerId) {
        const clientWithOverCard = equipment.find(e => e.id === over.id)?.client_id;
        if(clientWithOverCard) {
            overContainerId = clientWithOverCard;
        } else {
             overContainerId = over.id;
        }
    }

    const activeEquipment = equipment.find(e => e.id === active.id);
    const activeContainerId = activeEquipment?.client_id;
    
    if (!activeContainerId || !overContainerId) return;

    if (activeContainerId !== overContainerId) {
      const { error } = await supabase.from('equipment_inventory').update({ client_id: overContainerId }).eq('id', active.id);
      if (error) { toast({ title: "Error", description: "No se pudo mover el equipo.", variant: "destructive" });
      } else { toast({ title: "Éxito", description: "Equipo movido a un nuevo cliente." }); onEquipmentUpdate(); }
    }
  };

  const handleDeleteEquipment = async (equipmentId) => {
    const { error } = await supabase.from('equipment_inventory').delete().eq('id', equipmentId);
    if (error) { toast({ title: "Error", description: "No se pudo eliminar el equipo.", variant: "destructive" });
    } else { toast({ title: "Éxito", description: "Equipo eliminado del inventario." }); onEquipmentUpdate(); }
  };

  const handleDeleteClient = async (clientId) => {
    const { error: deleteEquipError } = await supabase.from('equipment_inventory').delete().eq('client_id', clientId);
    if(deleteEquipError) {
        toast({ title: "Error", description: "No se pudieron eliminar los equipos del cliente.", variant: "destructive" });
        return;
    }

    const { error: deleteClientError } = await supabase.from('clients').delete().eq('id', clientId);
     if (deleteClientError) { toast({ title: "Error", description: "No se pudo eliminar el cliente.", variant: "destructive" });
    } else { toast({ title: "Éxito", description: "Cliente y sus equipos han sido eliminados." }); onEquipmentUpdate(); }
  }
  
  if (loading) return <div className="text-center py-10 text-lg text-green-500">Cargando estado de equipos...</div>;
  
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="p-2 md:p-4">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-cyan-400 to-blue-500 pb-1">Panel de Estado de Equipos</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Arrastra para mover equipos. Haz clic en el nombre del cliente para ver detalles.</p>
          </div>
          <Button onClick={() => setAddModalOpen(true)}><PlusCircle className="mr-2 h-4 w-4"/>Añadir Equipo</Button>
        </div>
        <AddEquipmentModal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} onEquipmentAdded={onEquipmentUpdate} clients={clients} />

        {clients && clients.length > 0 ? (
          <div className="space-y-6">
            {clients.map((client) => ( <ClientEquipmentSection key={client.id} client={client} equipment={clientEquipmentMap[client.id] || []} serviceOrders={serviceOrders} reminders={reminders} onUpdate={onEquipmentUpdate} onDelete={handleDeleteEquipment} onClientSelect={onClientSelect} onDeleteClient={handleDeleteClient}/> ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500"><HardDrive className="h-20 w-20 mx-auto text-slate-400 mb-4" /><h3 className="text-xl font-semibold mb-2">No hay clientes para mostrar</h3><p>Añada clientes para empezar a gestionar equipos.</p></div>
        )}
      </motion.div>
    </DndContext>
  );
};

export default EquipmentStatusPage;