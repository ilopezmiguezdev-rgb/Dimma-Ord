import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, UserPlus, Trash2 } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { addClient as saveNewClientDB, getReagentTypes, addReagentType as saveNewReagentTypeDB } from '@/config/reagentsData';
import AddClientModal from '@/components/AddClientModal';
import AddReagentTypeModal from '@/components/AddReagentTypeModal';
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Combobox } from "@/components/ui/combobox";

const initialItem = { id: uuidv4(), reagentName: '', reagentSize: '', quantity: 1, isPending: false, pendingNotes: '' };

const ReagentDeliveryForm = ({ isOpen, onClose, onSave, existingDelivery, clients: propClients }) => {
  const { user } = useAuth() || {};
  const [selectedClientName, setSelectedClientName] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split('T')[0]);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [items, setItems] = useState([initialItem]);
  
  const [clientsList, setClientsList] = useState(propClients || []);
  const [reagentTypesList, setReagentTypesList] = useState([]);

  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [isAddReagentTypeModalOpen, setIsAddReagentTypeModalOpen] = useState(false);

  const refreshClients = useCallback(async () => {
    setClientsList(propClients || []);
  }, [propClients]);

  const refreshReagentTypes = useCallback(async () => {
    const types = await getReagentTypes();
    setReagentTypesList(Array.isArray(types) ? types : []);
  }, []);

  useEffect(() => {
    if (isOpen) {
      refreshClients();
      refreshReagentTypes();
    }
  }, [isOpen, refreshClients, refreshReagentTypes]);

  useEffect(() => {
    if (isOpen) {
      if (existingDelivery) {
        setSelectedClientName(existingDelivery.client_name || '');
        setDeliveryDate(existingDelivery.delivery_date || new Date().toISOString().split('T')[0]);
        setDeliveryNotes(existingDelivery.notes || '');
        const deliveryItems = existingDelivery.delivery_items || [{ ...initialItem, id: uuidv4() }];
        setItems(deliveryItems.map(item => ({...item, id: item.id || uuidv4(), reagentName: item.reagent_name, reagentSize: item.reagent_size, isPending: item.is_pending || false, pendingNotes: item.pending_notes || ''})));
      } else {
        setSelectedClientName('');
        setDeliveryDate(new Date().toISOString().split('T')[0]);
        setDeliveryNotes('');
        setItems([{ ...initialItem, id: uuidv4() }]);
      }
    }
  }, [existingDelivery, isOpen]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    if (field === 'reagentName') {
      newItems[index].reagentSize = ''; 
    }
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { ...initialItem, id: uuidv4() }]);
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleClientNameChange = (value) => {
    if (value === "add_new_client") {
      setIsAddClientModalOpen(true);
      return;
    }
    setSelectedClientName(value);
  };
  
  const handleReagentNameChangeForItem = (index, value) => {
    handleItemChange(index, 'reagentName', value);
  };

  const handleSaveNewClient = async (newClient) => {
    const savedClient = await saveNewClientDB(newClient);
    if (savedClient) {
      setClientsList(prev => [...prev, savedClient]);
      setSelectedClientName(savedClient.name); 
      toast({ title: "Cliente Agregado", description: `${savedClient.name} ha sido agregado a la lista.` });
    }
    setIsAddClientModalOpen(false);
  };

  const handleSaveNewReagentType = async (newReagent) => {
    const savedReagent = await saveNewReagentTypeDB(newReagent);
    if (savedReagent) {
      await refreshReagentTypes();
      toast({ title: "Reactivo Agregado", description: `${savedReagent.name} ha sido agregado a la lista.` });
    }
    setIsAddReagentTypeModalOpen(false);
  };
  
  const getAvailableSizes = (reagentName) => {
      const reagent = reagentTypesList.find(r => r.name.toLowerCase() === reagentName.toLowerCase());
      return reagent?.sizes || [];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClientName || selectedClientName.trim() === "") {
      toast({ title: "Error de validación", description: "Por favor, seleccione un cliente.", variant: "destructive" });
      return;
    }

    const validItems = items.filter(item => item.reagentName && item.reagentSize && item.quantity > 0);
    
    if (validItems.length === 0) {
      toast({ title: "Error de validación", description: "Agregue al menos un ítem válido a la entrega.", variant: "destructive" });
      return;
    }
    
    const deliveryToSave = {
      client_name: selectedClientName.trim(),
      delivery_date: deliveryDate,
      notes: deliveryNotes,
      delivery_items: validItems.map(({ id, reagentName, reagentSize, quantity, isPending, pendingNotes }) => ({
        id: id || uuidv4(),
        reagent_name: reagentName,
        reagent_size: reagentSize,
        quantity: parseInt(quantity, 10),
        is_pending: isPending,
        pending_notes: pendingNotes || ''
      })),
      id: existingDelivery ? existingDelivery.id : uuidv4(),
      user_id: user?.id || 'system',
      reagent_name: validItems[0].reagentName,
      reagent_size: validItems[0].reagentSize,
      quantity: validItems.reduce((acc, item) => acc + parseInt(item.quantity, 10), 0)
    };

    await onSave(deliveryToSave);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl bg-slate-50 dark:bg-slate-900 shadow-2xl rounded-xl border dark:border-slate-700 flex flex-col h-full sm:h-auto max-h-[95vh]">
          <DialogHeader className="p-6">
            <DialogTitle className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-teal-600 py-2">
              {existingDelivery ? 'Editar Entrega de Reactivo' : 'Registrar Nueva Entrega'}
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Complete los detalles de la entrega. Puede agregar múltiples reactivos.
            </DialogDescription>
          </DialogHeader>
          
          <form id="reagent-delivery-form" onSubmit={handleSubmit} className="flex-grow overflow-y-auto px-6 styled-scrollbar">
            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName" className="text-slate-700 dark:text-slate-300 font-semibold">Cliente *</Label>
                  <Select name="clientName" value={selectedClientName} onValueChange={handleClientNameChange} required>
                    <SelectTrigger className="w-full bg-white dark:bg-slate-800 dark:text-white dark:border-slate-700">
                      <SelectValue placeholder="Seleccionar cliente" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                      {clientsList.map(client => <SelectItem key={client.id} value={client.name}>{client.name}</SelectItem>)}
                      <SelectItem value="add_new_client" className="text-teal-500 font-semibold">
                        <UserPlus className="inline-block mr-2 h-4 w-4" /> Agregar Nuevo Cliente...
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveryDate" className="text-slate-700 dark:text-slate-300 font-semibold">Fecha de Entrega</Label>
                  <Input type="date" id="deliveryDate" name="deliveryDate" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} className="bg-white dark:bg-slate-800 dark:text-white dark:border-slate-700"/>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-teal-600 dark:text-teal-400 border-b border-teal-500/30 pb-2">Ítems de Entrega</h3>
                {items.map((item, index) => (
                  <div key={item.id} className="p-4 border rounded-lg bg-slate-100 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 relative">
                    <h4 className="text-sm font-semibold mb-2 text-teal-600 dark:text-teal-400">Ítem {index + 1}</h4>
                    {items.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="absolute top-2 right-2 text-red-500 hover:text-red-400 h-7 w-7">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor={`reagentName-${item.id}`} className="text-xs">Reactivo *</Label>
                        <Combobox
                            options={reagentTypesList.map(r => ({ value: r.name, label: r.name }))}
                            value={item.reagentName}
                            onValueChange={(value) => handleReagentNameChangeForItem(index, value)}
                            placeholder="Seleccionar reactivo"
                            searchPlaceholder="Buscar reactivo..."
                            emptyMessage="No se encontró el reactivo."
                            onAddNew={() => setIsAddReagentTypeModalOpen(true)}
                            addNewLabel="Agregar nuevo reactivo"
                            className="bg-white dark:bg-slate-800 dark:text-white dark:border-slate-700 text-xs h-9"
                         />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`reagentSize-${item.id}`} className="text-xs">Tamaño *</Label>
                        <Select name="reagentSize" value={item.reagentSize} onValueChange={(value) => handleItemChange(index, 'reagentSize', value)} required disabled={!item.reagentName}>
                          <SelectTrigger className="w-full bg-white dark:bg-slate-800 dark:text-white dark:border-slate-700 text-xs">
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                            {getAvailableSizes(item.reagentName).map(size => <SelectItem key={size} value={size}>{size}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`quantity-${item.id}`} className="text-xs">Cantidad *</Label>
                        <Input id={`quantity-${item.id}`} name="quantity" type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} required className="bg-white dark:bg-slate-800 dark:text-white dark:border-slate-700 text-xs"/>
                      </div>
                    </div>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center space-x-2">
                         <Checkbox 
                            id={`isPending-${item.id}`} 
                            checked={item.isPending} 
                            onCheckedChange={(checked) => handleItemChange(index, 'isPending', Boolean(checked))}
                          />
                        <Label htmlFor={`isPending-${item.id}`} className="text-xs font-medium text-amber-600 dark:text-amber-400">Marcar como pendiente/faltante</Label>
                      </div>
                      {item.isPending && (
                        <Textarea 
                          id={`pendingNotes-${item.id}`}
                          value={item.pendingNotes}
                          onChange={(e) => handleItemChange(index, 'pendingNotes', e.target.value)}
                          placeholder="Notas sobre el pendiente (ej: stock agotado, se entrega la próxima semana)"
                          className="bg-amber-50 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-xs"
                          rows={2}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" onClick={addItem} className="mt-4 w-full text-teal-500 border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/50 dark:text-teal-400 dark:border-teal-700">
                <PlusCircle className="mr-2 h-4 w-4" /> Agregar Otro Ítem
              </Button>

              <div className="space-y-2 mt-4">
                <Label htmlFor="deliveryNotes" className="text-slate-700 dark:text-slate-300 font-semibold">Notas Generales de la Entrega</Label>
                <Textarea id="deliveryNotes" name="deliveryNotes" value={deliveryNotes} onChange={(e) => setDeliveryNotes(e.target.value)} placeholder="Cualquier nota relevante sobre la entrega completa..." className="bg-white dark:bg-slate-800 dark:text-white dark:border-slate-700"/>
              </div>
            </div>
          </form>
          <DialogFooter className="flex-shrink-0 mt-4 p-6 border-t border-slate-200 dark:border-slate-700">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">Cancelar</Button>
            <Button type="submit" form="reagent-delivery-form" className="w-full sm:w-auto bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out">
              {existingDelivery ? 'Guardar Cambios' : 'Registrar Entrega'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AddClientModal 
        isOpen={isAddClientModalOpen} 
        onClose={() => setIsAddClientModalOpen(false)} 
        onSave={handleSaveNewClient} 
      />
      <AddReagentTypeModal
        isOpen={isAddReagentTypeModalOpen}
        onClose={() => setIsAddReagentTypeModalOpen(false)}
        onSave={handleSaveNewReagentType}
      />
    </>
  );
};

export default ReagentDeliveryForm;