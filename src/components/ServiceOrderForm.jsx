import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/toaster";
import { supabase } from '@/lib/customSupabaseClient';

import FormSection from '@/components/service-order-form/FormSection';
import ClientInfo from '@/components/service-order-form/ClientInfo';
import EquipmentInfo from '@/components/service-order-form/EquipmentInfo';
import ServiceDetails from '@/components/service-order-form/ServiceDetails';
import PartsUsed from '@/components/service-order-form/PartsUsed';
import CostsSummary from '@/components/service-order-form/CostsSummary';
import { getInitialData } from '@/components/service-order-form/initialData';
import AddEquipmentModal from '@/components/AddEquipmentModal';
import AddSubClientModal from '@/components/AddSubClientModal';

const ServiceOrderForm = ({ isOpen, onClose, onSave, existingOrder, clients, onEquipmentUpdate, onAddNewClient }) => {
  const [formData, setFormData] = useState(getInitialData());
  const [clientEquipment, setClientEquipment] = useState([]);
  const [isFetchingEquipment, setIsFetchingEquipment] = useState(false);
  const [isAddEquipmentModalOpen, setAddEquipmentModalOpen] = useState(false);
  const [isAddSubClientModalOpen, setAddSubClientModalOpen] = useState(false);
  const [subClients, setSubClients] = useState([]);

  const resetForm = useCallback(() => {
    setFormData(getInitialData());
    setClientEquipment([]);
    setSubClients([]);
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (existingOrder) {
        setFormData({
          ...getInitialData(),
          ...existingOrder,
          sub_client_name: existingOrder.sub_client_name || '',
          sub_client_id: existingOrder.sub_client_id || null,
          client_id: existingOrder.client_id || '',
          clientName: existingOrder.client_name || '',
          clientContact: existingOrder.client_contact || '',
          clientLocation: existingOrder.client_location || '',
          equipmentType: existingOrder.equipment_type || '',
          equipmentBrand: existingOrder.equipment_brand || '',
          equipmentModel: existingOrder.equipment_model || '',
          equipmentSerial: existingOrder.equipment_serial || '',
          equipment_id: existingOrder.equipment_id || null,
          reportedIssue: existingOrder.reported_issue || '',
          workSummary: existingOrder.work_summary || '',
          taskTime: existingOrder.task_time || '',
          partsUsed: existingOrder.parts_used || [],
          laborHours: existingOrder.labor_hours || '',
          laborRate: existingOrder.labor_rate || '',
          transportCost: existingOrder.transport_cost || '',
          assigned_technician: existingOrder.assigned_technician || '',
          dateReceived: existingOrder.date_received || getInitialData().dateReceived,
          dateCompleted: existingOrder.date_completed || '',
        });
      } else {
        resetForm();
      }
    }
  }, [isOpen, existingOrder, resetForm]);

  const fetchClientData = useCallback(async (clientId) => {
    if (!clientId) {
      setClientEquipment([]);
      setSubClients([]);
      return;
    }

    setIsFetchingEquipment(true);
    const [equipmentRes, subClientsRes] = await Promise.all([
      supabase.from('equipment_inventory').select('id, serial_number, equipment_models(brand, model_name, equipment_types(name)), sub_clients(id, name)').eq('client_id', clientId),
      supabase.from('sub_clients').select('id, name, address').eq('client_id', clientId).order('name')
    ]);

    if (equipmentRes.error) {
      console.error("Error fetching client equipment", equipmentRes.error);
      setClientEquipment([]);
    } else {
      setClientEquipment(equipmentRes.data);
    }

    if (subClientsRes.error) {
      console.error("Error fetching sub-clients", subClientsRes.error);
      setSubClients([]);
    } else {
      setSubClients(subClientsRes.data);
    }
    setIsFetchingEquipment(false);
  }, []);

  useEffect(() => {
    fetchClientData(formData.client_id);
  }, [formData.client_id, fetchClientData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
     setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateCosts = useCallback(() => {
    const totalPartsCost = (formData.partsUsed || []).reduce((sum, part) => sum + (parseInt(part.totalCost, 10) || 0), 0);
    const laborCost = (parseFloat(formData.laborHours) || 0) * (parseInt(formData.laborRate, 10) || 0);
    const transportCost = parseInt(formData.transportCost, 10) || 0;
    const totalCost = totalPartsCost + laborCost + transportCost;
    return { 
        partsCost: totalPartsCost, 
        laborCost, 
        transportCost,
        totalCost 
    };
  }, [formData.partsUsed, formData.laborHours, formData.laborRate, formData.transportCost]);

  useEffect(() => {
    const { partsCost, laborCost, totalCost } = calculateCosts();
    setFormData(prev => ({ ...prev, partsCost, laborCost, totalCost }));
  }, [calculateCosts]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleEquipmentAdded = (newEquipment) => {
    setAddEquipmentModalOpen(false);
    if (newEquipment) {
      setClientEquipment(prev => [...prev, newEquipment]);
      setFormData(prev => ({
        ...prev,
        equipment_id: newEquipment.id,
        equipmentSerial: newEquipment.serial_number,
        equipmentType: newEquipment.equipment_models?.equipment_types?.name || '',
        equipmentBrand: newEquipment.equipment_models?.brand || '',
        equipmentModel: newEquipment.equipment_models?.model_name || '',
      }));
    }
    onEquipmentUpdate();
  };

  const handleSubClientAdded = (newSubClient) => {
    setAddSubClientModalOpen(false);
    if (newSubClient) {
      setSubClients(prev => [...prev, newSubClient].sort((a, b) => a.name.localeCompare(b.name)));
      setFormData(prev => ({
        ...prev,
        sub_client_id: newSubClient.id,
        sub_client_name: newSubClient.name,
        clientLocation: newSubClient.address || prev.clientLocation,
      }));
    }
    onEquipmentUpdate();
  };
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
        <DialogContent className="sm:max-w-4xl bg-slate-50 dark:bg-slate-900 shadow-2xl rounded-xl border dark:border-slate-700 flex flex-col h-full sm:h-[95vh]">
          <DialogHeader className="flex-shrink-0 p-6">
            <DialogTitle className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-teal-600 py-2">
              {existingOrder ? 'Editar Orden de Servicio' : 'Crear Nueva Orden de Servicio'}
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Complete los detalles de la orden de servicio de forma ordenada y clara.
            </DialogDescription>
          </DialogHeader>
          
          <form id="service-order-form" onSubmit={handleSubmit} className="flex-grow overflow-y-auto px-6 styled-scrollbar">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
              
              <div className="flex flex-col gap-6">
                <FormSection formData={formData} handleSelectChange={handleSelectChange} handleChange={handleChange} />
                
                <ClientInfo 
                  formData={formData} 
                  clients={clients}
                  subClients={subClients}
                  setFormData={setFormData} 
                  onAddNewClient={onAddNewClient} 
                  onAddNewSubClient={() => setAddSubClientModalOpen(true)}
                />
                
                <EquipmentInfo 
                  formData={formData} 
                  setFormData={setFormData} 
                  clientEquipment={clientEquipment} 
                  isFetchingEquipment={isFetchingEquipment}
                  onAddNewEquipment={() => setAddEquipmentModalOpen(true)}
                />
              </div>

              <div className="flex flex-col gap-6">
                <ServiceDetails formData={formData} handleChange={handleChange} />
                <PartsUsed formData={formData} setFormData={setFormData} />
                <CostsSummary formData={formData} handleChange={handleChange} />
              </div>

            </div>
          </form>

          <DialogFooter className="flex-shrink-0 p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">Cancelar</Button>
            <Button type="submit" form="service-order-form" className="bg-gradient-to-r from-sky-600 to-teal-600 text-white w-full sm:w-auto">
              {existingOrder ? 'Guardar Cambios' : 'Crear Orden'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AddEquipmentModal 
        isOpen={isAddEquipmentModalOpen} 
        onClose={() => setAddEquipmentModalOpen(false)} 
        onEquipmentAdded={handleEquipmentAdded} 
        clients={clients} 
        subClients={subClients}
        preselectedClientId={formData.client_id}
        preselectedSubClientId={formData.sub_client_id}
      />

      <AddSubClientModal
        isOpen={isAddSubClientModalOpen}
        onClose={() => setAddSubClientModalOpen(false)}
        onSubClientAdded={handleSubClientAdded}
        clientId={formData.client_id}
      />
    </>
  );
};

export default ServiceOrderForm;