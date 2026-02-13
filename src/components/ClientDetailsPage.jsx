import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Building, HardDrive, Calendar, Wrench, FlaskConical, PlusCircle, Save, X, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/toaster';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import AddSubClientModal from '@/components/AddSubClientModal';

const statusColors = {
  'Pendiente': 'bg-yellow-500',
  'En Progreso': 'bg-blue-500',
  'Completado': 'bg-green-500',
  'Cancelado': 'bg-red-500',
};

const EditableSubClientField = ({ subClient, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(subClient.name);
    const [address, setAddress] = useState(subClient.address);
    const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const handleSave = async () => {
        if (!name) {
            toast({ title: "Error", description: "El nombre del laboratorio no puede estar vacío.", variant: "destructive" });
            return;
        }
        const { error } = await supabase.from('sub_clients').update({ name, address }).eq('id', subClient.id);
        if (error) {
            toast({ title: "Error", description: "No se pudo actualizar el laboratorio.", variant: "destructive" });
        } else {
            toast({ title: "Éxito", description: "Laboratorio actualizado." });
            onUpdate();
        }
        setIsEditing(false);
    };

    const handleDelete = async () => {
        const { error } = await supabase.from('sub_clients').delete().eq('id', subClient.id);
        if (error) {
            toast({ title: "Error", description: "No se pudo eliminar el laboratorio. Verifique si tiene equipos asociados.", variant: "destructive" });
        } else {
            toast({ title: "Éxito", description: "Laboratorio eliminado." });
            onUpdate();
        }
        setDeleteDialogOpen(false);
    };

    if (isEditing) {
        return (
            <div className="p-3 bg-slate-200 dark:bg-slate-700 rounded-lg space-y-2">
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre del laboratorio" />
                <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Dirección" />
                <div className="flex items-center gap-2">
                    <Button size="sm" onClick={handleSave}><Save className="h-4 w-4 mr-1" /> Guardar</Button>
                    <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}><X className="h-4 w-4 mr-1" /> Cancelar</Button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="group flex justify-between items-center p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{address || 'Sin dirección'}</p>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsEditing(true)}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => setDeleteDialogOpen(true)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar Laboratorio?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Se eliminará permanentemente el laboratorio <span className="font-bold">{subClient.name}</span>. Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};


const ClientDetailsPage = ({ client, serviceOrders, deliveries, reminders, onBack, loading }) => {
  const [subClients, setSubClients] = useState([]);
  const [isAddSubClientModalOpen, setAddSubClientModalOpen] = useState(false);

  const fetchSubClients = async () => {
    if (!client?.id) return;
    const { data, error } = await supabase.from('sub_clients').select('*').eq('client_id', client.id).order('name');
    if (error) {
      console.error("Error fetching sub-clients:", error);
    } else {
      setSubClients(data);
    }
  };

  useEffect(() => {
    fetchSubClients();
  }, [client]);

  const handleSubClientAdded = (newSubClient) => {
    setSubClients(prev => [...prev, newSubClient].sort((a, b) => a.name.localeCompare(b.name)));
    setAddSubClientModalOpen(false);
  };

  const clientServiceOrders = useMemo(() => serviceOrders.filter(so => so.client_id === client?.id), [client, serviceOrders]);
  const clientDeliveries = useMemo(() => deliveries.filter(d => d.client_name === client?.name), [client, deliveries]);
  const clientReminders = useMemo(() => reminders.filter(r => r.client_id === client?.id), [client, reminders]);

  if (loading) {
    return <div className="text-center py-10">Cargando detalles del cliente...</div>;
  }

  if (!client) {
    return (
      <div className="text-center py-10">
        <p>Cliente no encontrado.</p>
        <Button onClick={onBack} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver al panel
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={onBack} variant="outline" size="icon" className="h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{client.name}</h1>
            <p className="text-slate-500 dark:text-slate-400">{client.address}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Órdenes de Servicio</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientServiceOrders.length}</div>
            <p className="text-xs text-muted-foreground">Totales</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entregas de Reactivos</CardTitle>
            <FlaskConical className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientDeliveries.length}</div>
            <p className="text-xs text-muted-foreground">Totales</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recordatorios Pendientes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientReminders.filter(r => r.status === 'Pendiente').length}</div>
            <p className="text-xs text-muted-foreground">Activos</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                    <Building className="mr-2 h-5 w-5" />
                    Laboratorios / Clínicas
                </div>
                <Button size="sm" onClick={() => setAddSubClientModalOpen(true)}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Añadir Laboratorio
                </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto styled-scrollbar pr-2">
              {subClients.length > 0 ? (
                subClients.map(sc => <EditableSubClientField key={sc.id} subClient={sc} onUpdate={fetchSubClients} />)
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No hay laboratorios registrados para este cliente.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center"><Wrench className="mr-2 h-5 w-5" /> Historial de Servicios Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-60 overflow-y-auto styled-scrollbar pr-2">
              {clientServiceOrders.slice(0, 5).map(order => (
                <div key={order.id} className="flex items-center justify-between p-2 rounded-md bg-slate-100 dark:bg-slate-800">
                  <div>
                    <p className="font-semibold text-sm">{order.equipment_model || 'Servicio General'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{order.reported_issue}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {order.date_received ? format(parseISO(order.date_received), 'dd MMM yyyy', { locale: es }) : 'N/A'}
                    </span>
                    <div className={`h-2 w-2 rounded-full ${statusColors[order.status] || 'bg-gray-400'}`} title={order.status}></div>
                  </div>
                </div>
              ))}
              {clientServiceOrders.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No hay órdenes de servicio recientes.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
      <AddSubClientModal
        isOpen={isAddSubClientModalOpen}
        onClose={() => setAddSubClientModalOpen(false)}
        onSubClientAdded={handleSubClientAdded}
        clientId={client.id}
      />
    </motion.div>
  );
};

export default ClientDetailsPage;