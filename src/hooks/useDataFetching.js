import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';

const useDataFetching = (isSessionReady) => {
  const [data, setData] = useState({
    clients: [],
    serviceOrders: [],
    deliveries: [],
    equipment: [],
    reminders: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (tableName, selectString = '*') => {
    const { data, error } = await supabase.from(tableName).select(selectString);
    if (error) {
      console.error(`Error fetching ${tableName}:`, error);
      return [];
    }
    return data || [];
  }, []);

  const migrateRemindersToPendingDeliveries = async () => {
    // Fetch pending reagent reminders that haven't been migrated
    const { data: remindersToMigrate, error: remindersError } = await supabase
      .from('reminders')
      .select('*')
      .eq('reminder_type', 'Entrega de reactivo')
      .eq('status', 'Pendiente');
  
    if (remindersError) {
      console.error('Error fetching reminders to migrate:', remindersError);
      return;
    }
  
    if (remindersToMigrate.length === 0) {
      // console.log('No new reagent reminders to migrate.');
      return;
    }
  
    // Group reminders by client
    const remindersByClient = remindersToMigrate.reduce((acc, reminder) => {
      const clientId = reminder.client_id || 'general';
      if (!acc[clientId]) {
        acc[clientId] = {
          client_id: reminder.client_id,
          client_name: reminder.client_name || 'General',
          reminders: []
        };
      }
      acc[clientId].reminders.push(reminder);
      return acc;
    }, {});
  
    const newPendingDeliveries = Object.values(remindersByClient).map(clientGroup => {
      const requestedItems = clientGroup.reminders.map(r => ({
        reagent_name: r.description,
        reagent_size: 'N/A', // Size is unknown from reminder
        quantity: 1, // Quantity is unknown
      }));
      
      const notes = clientGroup.reminders.map(r => r.description).join('; ');
  
      return {
        client_id: clientGroup.client_id,
        client_name: clientGroup.client_name,
        requested_items: requestedItems,
        notes: `Generado desde alertas: ${notes}`,
        status: 'Pendiente',
        requested_date: new Date().toISOString().split('T')[0],
        target_delivery_date: clientGroup.reminders[0]?.due_date || null
      };
    });
  
    if (newPendingDeliveries.length > 0) {
      const { error: insertError } = await supabase
        .from('pending_reagent_deliveries')
        .insert(newPendingDeliveries);
  
      if (insertError) {
        console.error('Error migrating reminders to pending deliveries:', insertError);
        toast({ title: "Error de Migración", description: "No se pudieron migrar algunas alertas de reactivos.", variant: "destructive" });
      } else {
        // If migration is successful, delete the old reminders
        const reminderIdsToDelete = remindersToMigrate.map(r => r.id);
        const { error: deleteError } = await supabase
          .from('reminders')
          .delete()
          .in('id', reminderIdsToDelete);
        
        if (deleteError) {
            console.error('Error deleting migrated reminders:', deleteError);
        } else {
            toast({ title: "Migración Completa", description: `${remindersToMigrate.length} alerta(s) de reactivos se han movido a 'Entregas Pendientes'.` });
        }
      }
    }
  };

  const fetchAllData = useCallback(async () => {
    if (!isSessionReady) return;
    setLoading(true);
    try {
      await migrateRemindersToPendingDeliveries();

      const [clients, serviceOrders, deliveries, equipment, reminders] = await Promise.all([
        fetchData('clients'),
        fetchData('service_orders', '*, clients(name, address)'),
        fetchData('reagent_deliveries'),
        fetchData('equipment_inventory', '*, equipment_models(*, equipment_types(*))'),
        fetchData('reminders'),
      ]);
      setData({ clients, serviceOrders, deliveries, equipment, reminders });
    } catch (error) {
      console.error("Error fetching all data:", error);
    } finally {
      setLoading(false);
    }
  }, [fetchData, isSessionReady]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const refreshData = useCallback(async (dataType) => {
    setLoading(true);
    let selectString = '*';
    if (dataType === 'equipment') selectString = '*, equipment_models(*, equipment_types(*))';
    if (dataType === 'serviceOrders') selectString = '*, clients(name, address)';
    
    let tableName = dataType;
    if (dataType === 'equipment') tableName = 'equipment_inventory';
    if (dataType === 'serviceOrders') tableName = 'service_orders';
    if (dataType === 'deliveries') tableName = 'reagent_deliveries';
    if (dataType === 'pendingDeliveries') tableName = 'pending_reagent_deliveries';


    const refreshed = await fetchData(
       tableName, 
       selectString
    );

    setData(prev => ({ ...prev, [dataType]: refreshed }));
    setLoading(false);
  }, [fetchData]);

  return { ...data, loading, refreshData };
};

export default useDataFetching;