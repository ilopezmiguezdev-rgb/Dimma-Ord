import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import useDataFetching from '@/hooks/useDataFetching';
import useServiceOrderFilters from '@/hooks/useServiceOrderFilters';
import useModalState from '@/hooks/useModalState';
import { useAuth } from '@/contexts/SupabaseAuthContext';

import AppHeader from '@/components/AppHeader';
import MainTabs from '@/components/MainTabs';
import AddClientModal from '@/components/AddClientModal';
import { addClient } from '@/config/reagentsData';
import ClientDetailsPage from '@/components/ClientDetailsPage';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

import LoginPage from '@/components/auth/LoginPage';
import SignUpPage from '@/components/auth/SignUpPage';
import ForgotPasswordPage from '@/components/auth/ForgotPasswordPage';
import UpdatePasswordPage from '@/components/auth/UpdatePasswordPage';
import ProfilePage from '@/components/auth/ProfilePage';

const ServiceOrderForm = lazy(() => import('@/components/ServiceOrderForm'));
const ServiceOrderDetailsModal = lazy(() => import('@/components/ServiceOrderDetailsModal'));

import { v4 as uuidv4 } from 'uuid';

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut } = useAuth();

  const [activeTab, setActiveTab] = useState("equipmentStatus");
  const [isAddClientModalOpen, setAddClientModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(null);

  const {
    clients,
    serviceOrders,
    deliveries,
    equipment,
    reminders,
    loading: dataLoading,
    refreshData
  } = useDataFetching(!!user);

  const {
    formModal,
    detailsModal,
    currentOrder,
    handleAddNewOrder,
    handleEditOrder,
    handleViewDetails,
    closeAllModals
  } = useModalState();

  const {
    searchTerm, setSearchTerm,
    statusFilter, setStatusFilter,
    priorityFilter, setPriorityFilter,
    dateFilter, setDateFilter,
    technicianFilter, setTechnicianFilter,
    filteredOrders,
    setEquipmentSerialFilter
  } = useServiceOrderFilters(serviceOrders);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const equipmentSerial = params.get('equipment_serial');
    if (equipmentSerial) {
      setEquipmentSerialFilter(equipmentSerial);
      setActiveTab('serviceOrders');
    }
  }, [location.search, setEquipmentSerialFilter]);

  const handleClientSelect = (clientId) => {
    setSelectedClientId(clientId);
    navigate(`/client/${clientId}`);
  };

  const handleBackToDashboard = () => {
    setSelectedClientId(null);
    setEquipmentSerialFilter('');
    navigate('/');
    setActiveTab('equipmentStatus');
  };

  const handleEquipmentUpdate = useCallback(() => {
    refreshData('equipment');
    refreshData('clients');
    refreshData('serviceOrders');
  }, [refreshData]);

  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/client/')) {
        const clientId = path.split('/')[2];
        setSelectedClientId(clientId);
    } else {
        setSelectedClientId(null);
    }
  }, [location]);

  useEffect(() => {
    if (!user) return;
    const channels = [
      supabase.channel('service_orders_realtime_app').on('postgres_changes', { event: '*', schema: 'public', table: 'service_orders' }, () => refreshData('serviceOrders')).subscribe(),
      supabase.channel('clients_realtime_app').on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => refreshData('clients')).subscribe(),
      supabase.channel('sub_clients_realtime_app').on('postgres_changes', { event: '*', schema: 'public', table: 'sub_clients' }, () => refreshData('clients')).subscribe(),
      supabase.channel('reagent-deliveries-changes-app').on('postgres_changes', { event: '*', schema: 'public', table: 'reagent_deliveries' }, () => refreshData('deliveries')).subscribe(),
      supabase.channel('equipment-changes-app').on('postgres_changes', { event: '*', schema: 'public', table: 'equipment_inventory' }, () => handleEquipmentUpdate()).subscribe(),
      supabase.channel('reminders-changes-app').on('postgres_changes', { event: '*', schema: 'public', table: 'reminders' }, () => refreshData('reminders')).subscribe(),
    ];
    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel).catch(console.error);
      });
    };
  }, [user, refreshData, handleEquipmentUpdate]);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleDeleteOrder = async (orderId) => {
    const { error } = await supabase.from('service_orders').delete().match({ id: orderId });
    if (error) {
      toast({ title: "Error al eliminar orden", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Orden Eliminada", description: `La orden de servicio ha sido eliminada.`, variant: "destructive" });
    }
  };

  const sanitizeNumeric = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
  };

  const sanitizeInteger = (value) => {
    const num = parseInt(value, 10);
    return isNaN(num) ? null : num;
  };

  const handleSaveOrder = async (orderData) => {
    const { id: existingId, ...formData } = orderData;
    let finalClientId = formData.client_id;
    let finalClientName = formData.clientName;
    let subClientId = formData.sub_client_id;
    let finalSubClientName = formData.sub_client_name;

    if (!finalClientId) {
      toast({ title: "Error", description: "Es necesario seleccionar un cliente.", variant: "destructive" });
      return;
    }

    if (finalSubClientName) {
        const { data: subClient, error: subClientError } = await supabase
            .from('sub_clients')
            .upsert(
                { client_id: finalClientId, name: finalSubClientName, address: formData.clientLocation },
                { onConflict: 'client_id,name', ignoreDuplicates: false }
            )
            .select()
            .single();

        if (subClientError) {
            toast({ title: "Error al guardar laboratorio", description: subClientError.message, variant: "destructive" });
            return;
        } else {
            subClientId = subClient.id;
        }
    } else {
        subClientId = null;
    }

    const orderPayload = {
      client_id: finalClientId,
      client_name: finalClientName,
      sub_client_id: subClientId,
      sub_client_name: finalSubClientName,
      client_contact: formData.clientContact,
      client_location: formData.clientLocation,
      equipment_id: formData.equipment_id || null,
      equipment_type: formData.equipmentType,
      equipment_brand: formData.equipmentBrand,
      equipment_model: formData.equipmentModel,
      equipment_serial: formData.equipmentSerial,
      reported_issue: formData.reportedIssue,
      work_summary: formData.workSummary,
      task_time: sanitizeNumeric(formData.taskTime),
      parts_used: (formData.partsUsed || []).map(p => ({
          ...p,
          quantity: sanitizeInteger(p.quantity),
          unitCost: sanitizeInteger(p.unitCost),
          totalCost: sanitizeInteger(p.totalCost),
      })),
      labor_hours: sanitizeNumeric(formData.laborHours),
      labor_rate: sanitizeInteger(formData.laborRate),
      parts_cost: sanitizeInteger(formData.partsCost),
      labor_cost: sanitizeInteger(formData.laborCost),
      transport_cost: sanitizeInteger(formData.transportCost),
      total_cost: sanitizeInteger(formData.totalCost),
      status: formData.status,
      order_type: formData.order_type,
      assigned_technician: formData.assigned_technician,
      date_received: formData.dateReceived || null,
      date_completed: formData.dateCompleted || null,
      creation_date: formData.creation_date,
    };

    if (existingId) {
      const { data, error } = await supabase.from('service_orders').update(orderPayload).match({ id: existingId }).select();
      if (error) toast({ title: "Error al actualizar orden", description: error.message, variant: "destructive" });
      else if (data) toast({ title: "Orden Actualizada 🎉", description: `La orden de servicio se actualizó.` });
    } else {
      orderPayload.id = uuidv4();
      const { data, error } = await supabase.from('service_orders').insert([orderPayload]).select();
      if (error) toast({ title: "Error al crear orden", description: error.message, variant: "destructive" });
      else if (data) toast({ title: "¡Orden Creada! 🚀", description: `Nueva orden de servicio agregada.` });
    }

    closeAllModals();
  };

  const handleSaveNewClient = async (clientData) => {
    const newClient = await addClient(clientData);
    if (newClient) {
      toast({ title: "Cliente Agregado", description: `El cliente "${newClient.name}" ha sido creado.` });
      setAddClientModalOpen(false);
    }
  };

  const logoUrl = "https://horizons-cdn.hostinger.com/3ce3d85f-4f57-4c75-9f23-346da62300fc/1d5487d0103b1ec9f0ebb6131f7ae9fb.jpg";
  const selectedClientData = clients.find(c => c.id === selectedClientId);

  const ProtectedLayout = ({ children }) => (
    <>
      <AppHeader
        logoUrl={logoUrl}
        onAddNewOrder={handleAddNewOrder}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        technicianFilter={technicianFilter}
        onTechnicianFilterChange={setTechnicianFilter}
        serviceOrders={serviceOrders}
        isMainAppScreen={!selectedClientId && activeTab === 'serviceOrders'}
        profile={profile}
        onLogout={handleLogout}
      />
      <main>{children}</main>
      <Suspense fallback={null}>
        <ServiceOrderForm
          isOpen={formModal.isOpen}
          onClose={closeAllModals}
          onSave={handleSaveOrder}
          existingOrder={currentOrder}
          clients={clients}
          onAddNewClient={() => setAddClientModalOpen(true)}
          onEquipmentUpdate={handleEquipmentUpdate}
        />
      </Suspense>
      <AddClientModal
        isOpen={isAddClientModalOpen}
        onClose={() => setAddClientModalOpen(false)}
        onSave={handleSaveNewClient}
      />
      {detailsModal.isOpen && (
        <Suspense fallback={null}>
          <ServiceOrderDetailsModal
            order={currentOrder}
            isOpen={detailsModal.isOpen}
            onClose={closeAllModals}
            logoUrl={logoUrl}
          />
        </Suspense>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-background text-foreground p-2 sm:p-4 md:p-8">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/update-password" element={<UpdatePasswordPage />} />
        <Route path="/" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <MainTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                loading={dataLoading}
                filteredOrders={filteredOrders}
                handleEditOrder={handleEditOrder}
                handleDeleteOrder={handleDeleteOrder}
                handleViewDetails={handleViewDetails}
                clients={clients}
                serviceOrders={serviceOrders}
                deliveries={deliveries}
                fetchDeliveries={() => refreshData('deliveries')}
                equipment={equipment}
                reminders={reminders}
                onEquipmentUpdate={handleEquipmentUpdate}
                handleClientSelect={handleClientSelect}
              />
            </ProtectedLayout>
          </ProtectedRoute>
        } />
        <Route path="/client/:clientId" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <ClientDetailsPage
                client={selectedClientData}
                serviceOrders={serviceOrders}
                deliveries={deliveries}
                reminders={reminders}
                onBack={handleBackToDashboard}
                loading={dataLoading}
              />
            </ProtectedLayout>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <ProfilePage />
            </ProtectedLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
};

export default App;
