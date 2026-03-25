import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Building, Phone, MapPin, Hotel as Hospital, Info, Mail, Save, AlertCircle } from 'lucide-react';
import { getInitialData } from '@/components/service-order-form/initialData';
import { supabase } from '@/lib/supabaseClient';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { motion } from 'framer-motion';
import { Combobox } from '@/components/ui/combobox';
import { useToast } from "@/components/ui/use-toast";

const ClientInfo = ({ formData, clients, subClients, setFormData, onAddNewClient, onAddNewSubClient }) => {
  const [isNewSubClient, setIsNewSubClient] = useState(false);
  const [contactEmail, setContactEmail] = useState('');
  const [emailSource, setEmailSource] = useState(null);
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (formData.sub_client_name && formData.client_id) {
      const subClientExists = subClients.some(sc => sc.name.trim().toLowerCase() === formData.sub_client_name.trim().toLowerCase());
      setIsNewSubClient(!subClientExists);
    } else {
      setIsNewSubClient(false);
    }
  }, [formData.sub_client_name, subClients, formData.client_id]);

  useEffect(() => {
    const fetchEmail = async () => {
      if (formData.sub_client_id) {
        const { data } = await supabase
          .from('sub_clients')
          .select('contact_email')
          .eq('id', formData.sub_client_id)
          .single();
        if (data?.contact_email) {
          setContactEmail(data.contact_email);
          setEmailSource('sub_client');
          return;
        }
      }
      if (formData.client_id) {
        const { data } = await supabase
          .from('clients')
          .select('contact_email')
          .eq('id', formData.client_id)
          .single();
        setContactEmail(data?.contact_email || '');
        setEmailSource('client');
      } else {
        setContactEmail('');
        setEmailSource(null);
      }
    };
    fetchEmail();
  }, [formData.client_id, formData.sub_client_id]);

  const handleSaveEmail = async () => {
    if (!emailSource) return;
    setIsSavingEmail(true);
    const table = emailSource === 'sub_client' ? 'sub_clients' : 'clients';
    const id = emailSource === 'sub_client' ? formData.sub_client_id : formData.client_id;
    const { error } = await supabase
      .from(table)
      .update({ contact_email: contactEmail })
      .eq('id', id);
    setIsSavingEmail(false);
    if (error) {
      toast({ title: "Error", description: "No se pudo guardar el email.", variant: "destructive" });
    }
  };

  const handleClientChange = async (clientName) => {
    const client = clients.find(c => c.name.toLowerCase() === clientName.toLowerCase());
    const clientId = client ? client.id : null;
    const initialData = getInitialData();

    let lastContact = '';

    if (client) {
        const { data: lastOrder } = await supabase
            .from('service_orders')
            .select('client_contact')
            .eq('client_id', clientId)
            .order('creation_date', { ascending: false })
            .limit(1)
            .single();

        if (lastOrder) {
            lastContact = lastOrder.client_contact || '';
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

        <div className="space-y-2">
          <Label htmlFor="contactEmail" className="flex items-center">
            <Mail className="mr-2 h-4 w-4"/>Email de Contacto (para PDF/notificaciones)
          </Label>
          <div className="flex gap-2">
            <Input
              id="contactEmail"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="email@ejemplo.com"
              disabled={!formData.client_id}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleSaveEmail}
              disabled={!contactEmail || isSavingEmail}
            >
              <Save className="h-4 w-4" />
            </Button>
          </div>
          {formData.client_id && !contactEmail && (
            <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              Sin email — no se podrán enviar PDFs ni notificaciones a este cliente.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientInfo;