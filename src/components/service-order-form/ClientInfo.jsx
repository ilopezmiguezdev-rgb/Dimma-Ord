import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building, Phone, MapPin, Hotel as Hospital, Info } from 'lucide-react';
import { getInitialData } from '@/components/service-order-form/initialData';
import { supabase } from '@/lib/customSupabaseClient';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { motion } from 'framer-motion';
import { Combobox } from '@/components/ui/combobox';

const ClientInfo = ({ formData, clients, subClients, setFormData, onAddNewClient, onAddNewSubClient }) => {
  const [isNewSubClient, setIsNewSubClient] = useState(false);

  useEffect(() => {
    if (formData.sub_client_name && formData.client_id) {
      const subClientExists = subClients.some(sc => sc.name.trim().toLowerCase() === formData.sub_client_name.trim().toLowerCase());
      setIsNewSubClient(!subClientExists);
    } else {
      setIsNewSubClient(false);
    }
  }, [formData.sub_client_name, subClients, formData.client_id]);

  const handleClientChange = async (clientName) => {
    const client = clients.find(c => c.name.toLowerCase() === clientName.toLowerCase());
    const clientId = client ? client.id : null;
    const initialData = getInitialData();
    
    let lastContact = '';
    let lastLocation = '';
    let lastSubClientName = '';
    let lastSubClientId = null;
    
    if (client) {
        const query = supabase
            .from('service_orders')
            .select('client_contact, client_location, sub_client_id, sub_client_name')
            .eq('client_id', clientId)
            .order('creation_date', { ascending: false })
            .limit(1)
            .single();

        const { data: lastOrder } = await query;
        
        if (lastOrder) {
            lastContact = lastOrder.client_contact || '';
            if (client.name.toLowerCase() === 'coech') {
                lastLocation = lastOrder.client_location || '';
                lastSubClientName = lastOrder.sub_client_name || '';
                lastSubClientId = lastOrder.sub_client_id || null;
            }
        }
    }

    setFormData(prev => ({
      ...initialData,
      id: prev.id, 
      creation_date: prev.creation_date,
      assigned_technician: prev.assigned_technician,
      status: prev.status,
      order_type: prev.order_type,
      client_id: clientId,
      clientName: client ? client.name : '',
      clientContact: lastContact,
      sub_client_name: lastSubClientName,
      sub_client_id: lastSubClientId,
      clientLocation: lastLocation,
      equipment_id: null,
      equipmentSerial: '',
      equipmentBrand: '',
      equipmentModel: '',
      equipmentType: ''
    }));
  };

  const handleSubClientChange = (subClientName) => {
    const selectedSubClient = subClients.find(sc => sc.name.toLowerCase() === subClientName.toLowerCase());
    setFormData(prev => ({
      ...prev,
      sub_client_name: subClientName,
      sub_client_id: selectedSubClient ? selectedSubClient.id : null,
      clientLocation: selectedSubClient ? selectedSubClient.address || '' : prev.clientLocation,
      equipment_id: null,
      equipmentSerial: '',
      equipmentBrand: '',
      equipmentModel: '',
      equipmentType: ''
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const clientOptions = clients.map(c => ({ value: c.name, label: c.name }));
  const subClientOptions = subClients.map(sc => ({ value: sc.name, label: sc.name }));

  return (
    <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold text-sky-700 dark:text-sky-400 mb-4 flex items-center"><Building className="mr-2 h-5 w-5"/>Información del Cliente</h3>
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
            <Label htmlFor="client_id">Cliente *</Label>
            <Combobox
                options={clientOptions}
                value={formData.clientName}
                onValueChange={handleClientChange}
                placeholder="Seleccionar cliente..."
                searchPlaceholder="Buscar cliente..."
                emptyMessage="Cliente no encontrado."
                onAddNew={onAddNewClient}
                addNewLabel="Añadir nuevo cliente"
            />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="sub_client_name" className="flex items-center"><Hospital className="mr-2 h-4 w-4"/>Laboratorio / Clínica (Opcional)</Label>
          <Combobox
                options={subClientOptions}
                value={formData.sub_client_name}
                onValueChange={handleSubClientChange}
                placeholder="Seleccionar laboratorio..."
                searchPlaceholder="Buscar laboratorio..."
                emptyMessage="Laboratorio no encontrado."
                onAddNew={onAddNewSubClient}
                addNewLabel="Añadir nuevo laboratorio"
                disabled={!formData.client_id}
            />
        </div>
        
        {isNewSubClient && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <Alert className="border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300">
              <Info className="h-4 w-4 text-amber-500" />
              <AlertTitle>Nuevo Laboratorio</AlertTitle>
              <AlertDescription>
                Estás creando un nuevo laboratorio. Por favor, completa la dirección a continuación.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        <div className="space-y-2">
          <Label htmlFor="clientLocation" className="flex items-center"><MapPin className="mr-2 h-4 w-4"/>Dirección</Label>
          <Input id="clientLocation" name="clientLocation" value={formData.clientLocation || ''} onChange={handleChange} placeholder="Calle, Número, Localidad" disabled={!formData.client_id} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="clientContact" className="flex items-center"><Phone className="mr-2 h-4 w-4"/>Contacto (Persona/Teléfono)</Label>
          <Input id="clientContact" name="clientContact" value={formData.clientContact || ''} onChange={handleChange} placeholder="Nombre de persona de contacto y/o teléfono" disabled={!formData.client_id} />
        </div>
      </div>
    </div>
  );
};

export default ClientInfo;