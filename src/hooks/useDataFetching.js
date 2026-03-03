import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

const useDataFetching = (isSessionReady) => {
  const [data, setData] = useState({
    clients: [],
    serviceOrders: [],
    deliveries: [],
    equipment: [],
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

  const fetchAllData = useCallback(async () => {
    if (!isSessionReady) return;
    setLoading(true);
    try {
      const [clients, serviceOrders, deliveries, equipment] = await Promise.all([
        fetchData('clients'),
        fetchData('service_orders', '*, clients(name, address)'),
        fetchData('reagent_deliveries'),
        fetchData('equipment_inventory', '*, equipment_models(*, equipment_types(*)), sub_clients(id, name, address, client_id, clients(id, name, address))'),
      ]);
      setData({ clients, serviceOrders, deliveries, equipment });
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
    if (dataType === 'equipment') selectString = '*, equipment_models(*, equipment_types(*)), sub_clients(id, name, address, client_id, clients(id, name, address))';
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