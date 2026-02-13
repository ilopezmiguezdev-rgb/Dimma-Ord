import React, { useMemo, useState, useEffect } from 'react';
import { BarChart, ChevronLeft, ChevronRight, Droplets } from 'lucide-react';
import { getReagentTypes as fetchReagentTypesFromDB } from '@/config/reagentsData';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560', '#82ca9d', '#8884d8', '#ffc658'];

const MonthNavigator = ({ currentMonth, onPrev, onNext }) => (
    <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onPrev} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="font-semibold text-md text-slate-700 dark:text-slate-200 w-32 text-center capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </span>
        <Button variant="outline" size="icon" onClick={onNext} className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
        </Button>
    </div>
);

const ReagentConsumptionByClientChart = ({ deliveries, clients, allReagentTypes }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedClient, setSelectedClient] = useState('');
  
    useEffect(() => {
      if (clients && clients.length > 0) {
        setSelectedClient(clients[0].name);
      }
    }, [clients]);
  
    const chartData = useMemo(() => {
      if (!selectedClient || !Array.isArray(allReagentTypes)) return [];
      
      const clientDeliveries = deliveries.filter(d => d.client_name === selectedClient);
      const intervalStart = startOfMonth(currentMonth);
      const intervalEnd = endOfMonth(currentMonth);
  
      const reagentTotals = {};
      allReagentTypes.forEach(reagent => reagentTotals[reagent.name] = 0);
  
      clientDeliveries.forEach(d => {
        if (!d.delivery_date) return;
        const deliveryDate = parseISO(d.delivery_date);
        if (isWithinInterval(deliveryDate, { start: intervalStart, end: intervalEnd })) {
           const items = d.delivery_items || [];
           items.forEach(item => {
              if (reagentTotals[item.reagent_name] !== undefined) {
                reagentTotals[item.reagent_name] += item.quantity || 0;
              }
           });
        }
      });
      
      return Object.entries(reagentTotals)
        .filter(([, quantity]) => quantity > 0) 
        .map(([reagentName, quantity]) => ({
          name: reagentName,
          Consumo: quantity,
        }));
  
    }, [deliveries, selectedClient, currentMonth, allReagentTypes]);
  
    return (
      <div className="mt-8 p-4 md:p-6 bg-white dark:bg-slate-800/60 backdrop-blur-md shadow-lg rounded-xl border border-teal-500/20">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-xl font-semibold text-teal-700 dark:text-teal-300 flex items-center">
            <BarChart className="h-6 w-6 mr-3 text-teal-500" /> Consumo por Cliente
          </h2>
          <div className="flex flex-col sm:flex-row items-center gap-4">
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger className="w-full sm:w-[200px] bg-slate-100 dark:bg-slate-700/50">
                      <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                      {clients.map(client => <SelectItem key={client.id} value={client.name}>{client.name}</SelectItem>)}
                  </SelectContent>
              </Select>
              <MonthNavigator
                  currentMonth={currentMonth}
                  onPrev={() => setCurrentMonth(m => subMonths(m, 1))}
                  onNext={() => setCurrentMonth(m => addMonths(m, 1))}
              />
          </div>
        </div>
        <div className="h-80 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer>
                <ComposedChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis type="number" tick={{ fill: 'currentColor', fontSize: 12 }} allowDecimals={false} />
                  <YAxis dataKey="name" type="category" tick={{ fill: 'currentColor', fontSize: 10 }} width={80} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--background)/.8)', backdropFilter: 'blur(4px)', border: '1px solid hsl(var(--border))' }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    formatter={(value) => [`${value} unidades`, 'Consumo']}
                  />
                  <Bar dataKey="Consumo" barSize={20}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-full">
                  <p className="text-center text-slate-500 dark:text-slate-400">
                    No hay datos para {selectedClient} en este mes.
                  </p>
              </div>
            )}
        </div>
      </div>
    );
  };
  
const ReagentStats = ({ deliveries, clients }) => {
  const [allReagentTypes, setAllReagentTypes] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoadingStats(true);
      const reagentTypes = await fetchReagentTypesFromDB();
      setAllReagentTypes(Array.isArray(reagentTypes) ? reagentTypes : []);
      setLoadingStats(false);
    };
    loadInitialData();
  }, []);

  if (loadingStats) {
    return <div className="text-center py-10 text-lg text-teal-500">Cargando estadísticas...</div>;
  }

  return (
    <ReagentConsumptionByClientChart 
        deliveries={deliveries} 
        clients={clients} 
        allReagentTypes={allReagentTypes} 
    />
  );
};

export default ReagentStats;