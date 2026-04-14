import React from 'react';
import { ClipboardCheck } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

const MaintenanceChecklist = ({ items, loading, onToggle }) => {
  if (loading) {
    return (
      <div className="mb-6 pb-6 border-b border-sky-500/30">
        <h3 className="text-lg font-semibold text-sky-700 dark:text-sky-300 mb-2 flex items-center">
          <ClipboardCheck className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
          Mantenimiento
        </h3>
        <p className="text-sm text-slate-500 italic">Cargando checklist...</p>
      </div>
    );
  }

  if (!items.length) return null;

  return (
    <div className="mb-6 pb-6 border-b border-sky-500/30">
      <h3 className="text-lg font-semibold text-sky-700 dark:text-sky-300 mb-2 flex items-center">
        <ClipboardCheck className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
        Mantenimiento
      </h3>
      <div className="space-y-2 bg-slate-200/50 dark:bg-slate-700/50 p-3 rounded-md">
        {items.map(item => (
          <label
            key={item.id}
            className="flex items-center gap-3 cursor-pointer hover:bg-slate-300/30 dark:hover:bg-slate-600/30 p-1.5 rounded"
          >
            <Checkbox
              checked={item.is_checked}
              onCheckedChange={() => onToggle(item.id, item.is_checked)}
            />
            <span className={`text-sm ${item.is_checked ? 'line-through text-slate-400' : ''}`}>
              {item.item_label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default MaintenanceChecklist;
