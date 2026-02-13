import React, { useMemo, useState, useEffect } from 'react';
import { BarChart as BarChartIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { getReagentTypes as fetchReagentTypesFromDB } from '@/config/reagentsData';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Legend } from 'recharts';
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

const ReagentConsumptionByClientChart = ({ deliveries, clients }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedClient, setSelectedClient] = useState('Todos');
    const [allReagentTypes, setAllReagentTypes] = useState([]);
  
    useEffect(() => {
      const loadReagentTypes = async () => {
          const types = await fetchReagentTypesFromDB();
          setAllReagentTypes(Array.isArray(types) ? types : []);
      };
      loadReagentTypes();
    }, []);
  
    const chartData = useMemo(() => {
      if (!allReagentTypes.length) return [];
      
      const intervalStart = startOfMonth(currentMonth);
      const intervalEnd = endOfMonth(currentMonth);

      const filteredDeliveries = deliveries.filter(d => {
        if (!d.delivery_date) return false;
        const deliveryDate = parseISO(d.delivery_date);
        return isWithinInterval(deliveryDate, { start: intervalStart, end: intervalEnd });
      });

      const clientData = {};
      
      const clientsToProcess = selectedClient === 'Todos' ? clients : clients.filter(c => c.name === selectedClient);

      clientsToProcess.forEach(client => {
          clientData[client.name] = {};
          allReagentTypes.forEach(reagent => {
              clientData[client.name][reagent.name] = 0;
          });
      });

      filteredDeliveries.forEach(delivery => {
        if (clientData[delivery.client_name]) {
          (delivery.delivery_items || []).forEach(item => {
            if (clientData[delivery.client_name][item.reagent_name] !== undefined) {
              clientData[delivery.client_name][item.reagent_name] += item.quantity || 0;
            }
          });
        }
      });
      
      const finalData = [];
      Object.keys(clientData).forEach(clientName => {
        const clientReagents = clientData[clientName];
        const hasData = Object.values(clientReagents).some(qty => qty > 0);
        if(hasData || selectedClient !== 'Todos') {
            finalData.push({ name: clientName, ...clientReagents });
        }
      });

      return finalData;
  
    }, [deliveries, selectedClient, currentMonth, allReagentTypes, clients]);
  
    return (
      <div className="bg-white dark:bg-slate-800/60 p-4 rounded-xl shadow-lg border border-purple-500/20 h-full">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-lg font-semibold text-purple-700 dark:text-purple-300 flex items-center">
            <BarChartIcon className="h-6 w-6 mr-3 text-purple-500" /> Consumo de Reactivos por Cliente
          </h2>
          <div className="flex flex-col sm:flex-row items-center gap-4">
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger className="w-full sm:w-[200px] bg-slate-100 dark:bg-slate-700/50">
                      <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="Todos">Todos los Clientes</SelectItem>
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
        <div className="h-96 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer>
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis type="number" tick={{ fill: 'currentColor', fontSize: 12 }} allowDecimals={false} />
                  <YAxis dataKey="name" type="category" tick={{ fill: 'currentColor', fontSize: 10 }} width={80} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--background)/.8)', backdropFilter: 'blur(4px)', border: '1px solid hsl(var(--border))' }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  {allReagentTypes.map((reagent, index) => (
                      <Bar key={reagent.name} dataKey={reagent.name} stackId="a" fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-full">
                  <p className="text-center text-slate-500 dark:text-slate-400">
                    No hay datos de consumo para los filtros seleccionados.
                  </p>
              </div>
            )}
        </div>
      </div>
    );
  };
  
  export default ReagentConsumptionByClientChart;