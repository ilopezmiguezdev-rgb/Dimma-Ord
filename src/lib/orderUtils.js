export const getStatusColor = (status) => {
  switch (status) {
    case 'Pendiente': return 'bg-amber-500/20 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border-amber-500/30';
    case 'En Progreso': return 'bg-sky-500/20 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400 border-sky-500/30';
    case 'Completada': return 'bg-emerald-500/20 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-500/30';
    case 'Facturado': return 'bg-green-600/20 text-green-700 dark:bg-green-500/10 dark:text-green-400 border-green-500/30';
    case 'Cancelada': return 'bg-red-500/20 text-red-600 dark:bg-red-500/10 dark:text-red-400 border-red-500/30';
    default: return 'bg-slate-500/20 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400 border-slate-500/30';
  }
};

export const getStatusColorSolid = (status) => {
  switch (status) {
    case 'Pendiente': return 'bg-amber-500 hover:bg-amber-600';
    case 'En Progreso': return 'bg-sky-500 hover:bg-sky-600';
    case 'Completada': return 'bg-emerald-500 hover:bg-emerald-600';
    case 'Facturado': return 'bg-green-600 hover:bg-green-700';
    case 'Cancelado':
    case 'Cancelada': return 'bg-red-500 hover:bg-red-600';
    default: return 'bg-slate-500 hover:bg-slate-600';
  }
};

export const getPriorityColor = (priority) => {
  switch (priority) {
    case 'Alta': return 'border-red-500 text-red-500 dark:border-red-400 dark:text-red-400';
    case 'Media': return 'border-amber-500 text-amber-500 dark:border-amber-400 dark:text-amber-400';
    case 'Baja': return 'border-emerald-500 text-emerald-500 dark:border-emerald-400 dark:text-emerald-400';
    default: return 'border-slate-400 text-slate-400 dark:border-slate-500 dark:text-slate-500';
  }
};

export const getOrderTypeColor = (orderType) => {
  switch (orderType) {
    case 'Mantenimiento': return 'border-blue-500/50 text-blue-600 dark:text-blue-400';
    case 'Service': return 'border-amber-500/50 text-amber-600 dark:text-amber-400';
    case 'Visita': return 'border-indigo-500/50 text-indigo-600 dark:text-indigo-400';
    case 'Instalacion': return 'border-teal-500/50 text-teal-600 dark:text-teal-400';
    default: return 'border-slate-400/50 text-slate-500 dark:text-slate-400';
  }
};

export const isMobile = () =>
  typeof window !== 'undefined' && window.innerWidth < 768;
