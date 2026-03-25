import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Building, PlusCircle, Trash2, Pencil, Save, X, Mail, MapPin, Search, FlaskConical } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import usePermissions from '@/hooks/usePermissions';

const EditableField = ({ initialValue, fieldName, entityId, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);

  useEffect(() => { setValue(initialValue); }, [initialValue]);

  const handleSave = async () => {
    await onUpdate(entityId, fieldName, value);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') { setValue(initialValue); setIsEditing(false); }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <Input value={value} onChange={e => setValue(e.target.value)} onKeyDown={handleKeyDown} className="h-7 text-xs" autoFocus />
        <Button size="icon" className="h-7 w-7" onClick={handleSave}><Save className="h-3 w-3" /></Button>
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setValue(initialValue); setIsEditing(false); }}><X className="h-3 w-3" /></Button>
      </div>
    );
  }

  return (
    <div onClick={() => setIsEditing(true)} className="group flex items-center justify-between hover:bg-slate-200 dark:hover:bg-slate-700 p-1 rounded cursor-pointer">
      <span className="truncate text-sm">{value || <span className="text-slate-400 italic">Sin datos</span>}</span>
      <Pencil className="h-3 w-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </div>
  );
};

const ClientManagementPage = ({ clients }) => {
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [subClients, setSubClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [subClientSearch, setSubClientSearch] = useState('');
  const { canDelete } = usePermissions();

  const [showAddClient, setShowAddClient] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');

  const [showAddSubClient, setShowAddSubClient] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubAddress, setNewSubAddress] = useState('');
  const [newSubEmail, setNewSubEmail] = useState('');

  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchSubClients = useCallback(async (clientId) => {
    if (!clientId) { setSubClients([]); return; }
    const { data, error } = await supabase
      .from('sub_clients')
      .select('*')
      .eq('client_id', clientId)
      .order('name');
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSubClients(data || []);
    }
  }, []);

  useEffect(() => {
    fetchSubClients(selectedClientId);
  }, [selectedClientId, fetchSubClients]);

  const selectedClient = clients.find(c => c.id === selectedClientId);

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredSubClients = subClients.filter(sc =>
    sc.name.toLowerCase().includes(subClientSearch.toLowerCase())
  );

  const handleAddClient = async () => {
    if (!newClientName.trim()) return;
    const { error } = await supabase.from('clients').insert([{
      id: `client-${Date.now()}`,
      name: newClientName.trim(),
      address: newClientAddress.trim() || null,
      contact_email: newClientEmail.trim() || null,
    }]).select();
    if (error) {
      toast({
        title: "Error",
        description: error.code === '23505' ? 'Ya existe un cliente con este nombre.' : error.message,
        variant: "destructive"
      });
    } else {
      toast({ title: "Éxito", description: "Cliente creado." });
      setNewClientName(''); setNewClientAddress(''); setNewClientEmail('');
      setShowAddClient(false);
    }
  };

  const handleUpdateClient = async (clientId, field, value) => {
    const { error } = await supabase.from('clients').update({ [field]: value }).eq('id', clientId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Éxito", description: "Cliente actualizado." });
    }
  };

  const handleDeleteClient = async (clientId) => {
    const { error } = await supabase.from('clients').delete().eq('id', clientId);
    if (error) {
      toast({
        title: "Error al eliminar",
        description: error.message.includes('violates foreign key')
          ? 'No se puede eliminar: este cliente tiene laboratorios, equipos u órdenes asociadas.'
          : error.message,
        variant: "destructive"
      });
    } else {
      toast({ title: "Éxito", description: "Cliente eliminado." });
      if (selectedClientId === clientId) {
        setSelectedClientId(null);
        setSubClients([]);
      }
    }
    setDeleteTarget(null);
  };

  const handleAddSubClient = async () => {
    if (!newSubName.trim() || !selectedClientId) return;
    const { error } = await supabase.from('sub_clients').insert([{
      client_id: selectedClientId,
      name: newSubName.trim(),
      address: newSubAddress.trim() || null,
      contact_email: newSubEmail.trim() || null,
    }]).select();
    if (error) {
      toast({
        title: "Error",
        description: error.code === '23505' ? 'Ya existe un laboratorio con este nombre para este cliente.' : error.message,
        variant: "destructive"
      });
    } else {
      toast({ title: "Éxito", description: "Laboratorio creado." });
      setNewSubName(''); setNewSubAddress(''); setNewSubEmail('');
      setShowAddSubClient(false);
      fetchSubClients(selectedClientId);
    }
  };

  const handleUpdateSubClient = async (subClientId, field, value) => {
    const { error } = await supabase.from('sub_clients').update({ [field]: value }).eq('id', subClientId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Éxito", description: "Laboratorio actualizado." });
      fetchSubClients(selectedClientId);
    }
  };

  const handleDeleteSubClient = async (subClientId) => {
    const { error } = await supabase.from('sub_clients').delete().eq('id', subClientId);
    if (error) {
      toast({
        title: "Error al eliminar",
        description: error.message.includes('violates foreign key')
          ? 'No se puede eliminar: este laboratorio tiene equipos u órdenes asociadas.'
          : error.message,
        variant: "destructive"
      });
    } else {
      toast({ title: "Éxito", description: "Laboratorio eliminado." });
      fetchSubClients(selectedClientId);
    }
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
          <Building className="mr-2 h-6 w-6 text-amber-500" /> Gestión de Clientes
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT PANEL: Clients */}
        <div className="bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Clientes</h3>
            <Button size="sm" onClick={() => setShowAddClient(true)}>
              <PlusCircle className="h-4 w-4 mr-1" /> Nuevo
            </Button>
          </div>

          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {showAddClient && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              className="border border-amber-500/30 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 mb-3 space-y-2">
              <Input placeholder="Nombre *" value={newClientName} onChange={e => setNewClientName(e.target.value)} />
              <Input placeholder="Dirección" value={newClientAddress} onChange={e => setNewClientAddress(e.target.value)} />
              <Input placeholder="Email de contacto" type="email" value={newClientEmail} onChange={e => setNewClientEmail(e.target.value)} />
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="ghost" onClick={() => setShowAddClient(false)}>Cancelar</Button>
                <Button size="sm" onClick={handleAddClient} disabled={!newClientName.trim()}>Guardar</Button>
              </div>
            </motion.div>
          )}

          <div className="space-y-1 max-h-[60vh] overflow-y-auto">
            {filteredClients.map(client => (
              <div
                key={client.id}
                onClick={() => setSelectedClientId(client.id)}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors
                  ${selectedClientId === client.id
                    ? 'bg-amber-100 dark:bg-amber-900/30 border border-amber-500/50'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-transparent'}`}
              >
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{client.name}</p>
                  {client.address && <p className="text-xs text-slate-500 truncate">{client.address}</p>}
                </div>
                {canDelete && (
                  <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0 text-red-400 hover:text-red-600"
                    onClick={e => { e.stopPropagation(); setDeleteTarget({ type: 'client', id: client.id, name: client.name }); }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            {filteredClients.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">No se encontraron clientes.</p>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Selected client detail + subclients */}
        <div className="bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          {selectedClient ? (
            <>
              <div className="mb-6 space-y-3">
                <h3 className="text-lg font-semibold text-amber-600 dark:text-amber-400 flex items-center">
                  <Building className="mr-2 h-5 w-5" /> {selectedClient.name}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <Label className="text-xs text-slate-500 flex items-center"><Pencil className="h-3 w-3 mr-1"/>Nombre</Label>
                    <EditableField initialValue={selectedClient.name} fieldName="name" entityId={selectedClient.id} onUpdate={handleUpdateClient} />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500 flex items-center"><MapPin className="h-3 w-3 mr-1"/>Dirección</Label>
                    <EditableField initialValue={selectedClient.address || ''} fieldName="address" entityId={selectedClient.id} onUpdate={handleUpdateClient} />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-xs text-slate-500 flex items-center"><Mail className="h-3 w-3 mr-1"/>Email de Contacto</Label>
                    <EditableField initialValue={selectedClient.contact_email || ''} fieldName="contact_email" entityId={selectedClient.id} onUpdate={handleUpdateClient} />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-slate-700 dark:text-slate-200 flex items-center">
                    <FlaskConical className="mr-2 h-4 w-4 text-sky-500" /> Laboratorios / Clínicas
                  </h4>
                  <Button size="sm" variant="outline" onClick={() => setShowAddSubClient(true)}>
                    <PlusCircle className="h-4 w-4 mr-1" /> Nuevo
                  </Button>
                </div>

                {subClients.length > 5 && (
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input placeholder="Buscar laboratorio..." value={subClientSearch} onChange={e => setSubClientSearch(e.target.value)} className="pl-9" />
                  </div>
                )}

                {showAddSubClient && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    className="border border-sky-500/30 bg-sky-50 dark:bg-sky-900/20 rounded-lg p-3 mb-3 space-y-2">
                    <Input placeholder="Nombre *" value={newSubName} onChange={e => setNewSubName(e.target.value)} />
                    <Input placeholder="Dirección" value={newSubAddress} onChange={e => setNewSubAddress(e.target.value)} />
                    <Input placeholder="Email de contacto" type="email" value={newSubEmail} onChange={e => setNewSubEmail(e.target.value)} />
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="ghost" onClick={() => setShowAddSubClient(false)}>Cancelar</Button>
                      <Button size="sm" onClick={handleAddSubClient} disabled={!newSubName.trim()}>Guardar</Button>
                    </div>
                  </motion.div>
                )}

                <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                  {filteredSubClients.map(sc => (
                    <div key={sc.id} className="flex items-start justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/30">
                      <div className="space-y-1 min-w-0 flex-1">
                        <EditableField initialValue={sc.name} fieldName="name" entityId={sc.id} onUpdate={handleUpdateSubClient} />
                        <div className="text-xs text-slate-500">
                          <span className="flex items-center"><MapPin className="h-3 w-3 mr-1" /><EditableField initialValue={sc.address || ''} fieldName="address" entityId={sc.id} onUpdate={handleUpdateSubClient} /></span>
                          <span className="flex items-center"><Mail className="h-3 w-3 mr-1" /><EditableField initialValue={sc.contact_email || ''} fieldName="contact_email" entityId={sc.id} onUpdate={handleUpdateSubClient} /></span>
                        </div>
                      </div>
                      {canDelete && (
                        <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0 text-red-400 hover:text-red-600"
                          onClick={() => setDeleteTarget({ type: 'sub_client', id: sc.id, name: sc.name })}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {subClients.length === 0 && (
                    <p className="text-sm text-slate-400 text-center py-4">Este cliente no tiene laboratorios.</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 py-20">
              <Building className="h-12 w-12 mb-3 opacity-30" />
              <p>Selecciona un cliente para ver sus detalles</p>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de eliminar {deleteTarget?.type === 'client' ? 'el cliente' : 'el laboratorio'} &ldquo;{deleteTarget?.name}&rdquo;? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteTarget?.type === 'client'
                ? handleDeleteClient(deleteTarget.id)
                : handleDeleteSubClient(deleteTarget.id)}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClientManagementPage;
