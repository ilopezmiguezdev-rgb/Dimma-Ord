-- Checklist template items per equipment
CREATE TABLE maintenance_checklists (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id uuid NOT NULL REFERENCES equipment_inventory(id) ON DELETE CASCADE,
  item_label text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Per-order results
CREATE TABLE maintenance_checklist_results (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id text NOT NULL REFERENCES service_orders(id) ON DELETE CASCADE,
  checklist_item_id uuid NOT NULL REFERENCES maintenance_checklists(id) ON DELETE CASCADE,
  is_checked boolean NOT NULL DEFAULT false,
  notes text,
  checked_at timestamptz,
  checked_by uuid REFERENCES auth.users(id),
  UNIQUE(order_id, checklist_item_id)
);

-- RLS
ALTER TABLE maintenance_checklists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read" ON maintenance_checklists FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert" ON maintenance_checklists FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update" ON maintenance_checklists FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete" ON maintenance_checklists FOR DELETE TO authenticated USING (true);

ALTER TABLE maintenance_checklist_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read" ON maintenance_checklist_results FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert" ON maintenance_checklist_results FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update" ON maintenance_checklist_results FOR UPDATE TO authenticated USING (true);

-- Indexes
CREATE INDEX idx_maint_checklist_equipment ON maintenance_checklists(equipment_id);
CREATE INDEX idx_maint_results_order ON maintenance_checklist_results(order_id);
