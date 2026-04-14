import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

const useMaintenanceChecklist = (equipmentId, orderId, enabled) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchChecklist = useCallback(async () => {
    if (!equipmentId || !orderId || !enabled) return;
    setLoading(true);

    const { data: templateItems, error: tErr } = await supabase
      .from('maintenance_checklists')
      .select('*')
      .eq('equipment_id', equipmentId)
      .order('sort_order');

    if (tErr || !templateItems?.length) {
      setItems([]);
      setLoading(false);
      return;
    }

    const { data: results } = await supabase
      .from('maintenance_checklist_results')
      .select('*')
      .eq('order_id', orderId)
      .in('checklist_item_id', templateItems.map(t => t.id));

    const resultsMap = Object.fromEntries(
      (results || []).map(r => [r.checklist_item_id, r])
    );

    setItems(templateItems.map(t => ({
      ...t,
      is_checked: resultsMap[t.id]?.is_checked || false,
      result_id: resultsMap[t.id]?.id || null,
      notes: resultsMap[t.id]?.notes || '',
    })));
    setLoading(false);
  }, [equipmentId, orderId, enabled]);

  useEffect(() => { fetchChecklist(); }, [fetchChecklist]);

  const toggleItem = useCallback(async (checklistItemId, currentChecked) => {
    const newChecked = !currentChecked;
    const existing = items.find(i => i.id === checklistItemId);

    if (existing?.result_id) {
      await supabase
        .from('maintenance_checklist_results')
        .update({ is_checked: newChecked, checked_at: new Date().toISOString() })
        .eq('id', existing.result_id);
    } else {
      const { data } = await supabase
        .from('maintenance_checklist_results')
        .insert({
          order_id: orderId,
          checklist_item_id: checklistItemId,
          is_checked: newChecked,
          checked_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (data) {
        setItems(prev => prev.map(i =>
          i.id === checklistItemId ? { ...i, result_id: data.id } : i
        ));
      }
    }

    setItems(prev => prev.map(i =>
      i.id === checklistItemId ? { ...i, is_checked: newChecked } : i
    ));
  }, [items, orderId]);

  return { items, loading, toggleItem };
};

export default useMaintenanceChecklist;
