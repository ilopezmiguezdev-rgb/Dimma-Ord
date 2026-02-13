import React, { useMemo, useState, useEffect } from 'react';
import { Droplets, ChevronLeft, ChevronRight } from 'lucide-react';
import { getReagentTypes as fetchReagentTypesFromDB } from '@/config/reagentsData';
import { ComposedChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, startOfMonth, endOfMonth, isWithinInterval, addMonths, subMonths, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';

const CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#AF19FF'];

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

const TotalReagentConsumptionChart = ({ deliveries }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [allReagentTypes, setAllReagentTypes] = useState([]);
    
    useEffect(() => {
        const loadReagentTypes = async () => {
            const types = await fetchReagentTypesFromDB();
            setAllReagentTypes(Array.isArray(types) ? types : []);
        };
        loadReagentTypes();
    }, []);

    const data = useMemo(() => {
        const start = startOfMonth(currentMonth);
        const end = endOfMonth(currentMonth);
        const totals = {};
        allReagentTypes.forEach(reagent => totals[reagent.name] = 0);

        deliveries
            .filter(d => d.delivery_date && isWithinInterval(parseISO(d.delivery_date), { start, end }))
            .forEach(delivery => {
                (delivery.delivery_items || []).forEach(item => {
                    if (totals[item.reagent_name] !== undefined) {
                        totals[item.reagent_name] += item.quantity || 0;
                    }
                });
            });
        
        return Object.entries(totals)
            .filter(([, quantity]) => quantity > 0)
            .map(([reagentName, quantity]) => ({ name: reagentName, Consumo: quantity }));
    }, [deliveries, currentMonth, allReagentTypes]);

    return (
        <div className="bg-white dark:bg-slate-800/60 p-4 rounded-xl shadow-lg border border-purple-500/20 h-full">
            <header className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-purple-700 dark:text-purple-300 flex items-center">
                    <Droplets className="h-6 w-6 mr-3 text-purple-500" /> Consumo Total de Reactivos
                </h2>
                <MonthNavigator currentMonth={currentMonth} onPrev={() => setCurrentMonth(m => subMonths(m, 1))} onNext={() => setCurrentMonth(m => addMonths(m, 1))} />
            </header>
            <div className="h-80 w-full">
                {data.length > 0 ? (
                    <ResponsiveContainer>
                        <ComposedChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                            <XAxis type="number" tick={{ fill: 'currentColor', fontSize: 12 }} allowDecimals={false} />
                            <YAxis dataKey="name" type="category" tick={{ fill: 'currentColor', fontSize: 10 }} width={100} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'hsl(var(--background)/.8)', backdropFilter: 'blur(4px)', border: '1px solid hsl(var(--border))' }}
                                labelStyle={{ color: 'hsl(var(--foreground))' }}
                                formatter={(value) => [`${value} unidades`, 'Consumo Total']}
                            />
                            <Bar dataKey="Consumo" barSize={20}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                            </Bar>
                        </ComposedChart>
                    </ResponsiveContainer>
                ) : <p className="text-center pt-20 text-slate-500">Sin consumo de reactivos en este mes.</p>}
            </div>
        </div>
    );
};

export default TotalReagentConsumptionChart;