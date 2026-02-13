import React, { useMemo, useState } from 'react';
import { BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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

const ServiceReasonsChart = ({ serviceOrders }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const data = useMemo(() => {
        const start = startOfMonth(currentMonth);
        const end = endOfMonth(currentMonth);
        const reasonsCount = {};

        serviceOrders
            .filter(order => order.creation_date && isWithinInterval(parseISO(order.creation_date), { start, end }))
            .forEach(order => {
                if (!order.client_name || !order.reported_issue) return;
                if (!reasonsCount[order.client_name]) {
                    reasonsCount[order.client_name] = {};
                }
                const reason = order.reported_issue.trim();
                reasonsCount[order.client_name][reason] = (reasonsCount[order.client_name][reason] || 0) + 1;
            });

        return Object.entries(reasonsCount).map(([clientName, reasons]) => ({ name: clientName, ...reasons }));
    }, [serviceOrders, currentMonth]);

    const uniqueReasons = useMemo(() => {
        const start = startOfMonth(currentMonth);
        const end = endOfMonth(currentMonth);
        return [...new Set(serviceOrders
            .filter(o => o.creation_date && isWithinInterval(parseISO(o.creation_date), { start, end }))
            .map(o => o.reported_issue?.trim()).filter(Boolean))]
    }, [serviceOrders, currentMonth]);

    return (
        <div className="bg-white dark:bg-slate-800/60 p-4 rounded-xl shadow-lg border border-purple-500/20 h-full">
            <header className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-purple-700 dark:text-purple-300 flex items-center">
                    <BarChart3 className="h-6 w-6 mr-3 text-purple-500" /> Motivos de Servicio
                </h2>
                <MonthNavigator currentMonth={currentMonth} onPrev={() => setCurrentMonth(m => subMonths(m, 1))} onNext={() => setCurrentMonth(m => addMonths(m, 1))} />
            </header>
            <div className="h-64 w-full">
                {data.length > 0 ? (
                    <ResponsiveContainer>
                        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                            <XAxis type="number" allowDecimals={false} tick={{fontSize: 10, fill: 'currentColor'}}/>
                            <YAxis type="category" dataKey="name" width={60} tick={{fontSize: 10, fill: 'currentColor'}} />
                            <Tooltip contentStyle={{ fontSize: '12px', backgroundColor: 'hsl(var(--background)/.8)', backdropFilter: 'blur(4px)' }}/>
                            <Legend wrapperStyle={{ fontSize: '10px' }} />
                            {uniqueReasons.map((reason, i) => (
                                 <Bar key={reason} dataKey={reason} stackId="a" fill={CHART_COLORS[i % CHART_COLORS.length]} />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                ) : <p className="text-center pt-20 text-slate-500">Sin motivos de servicio en este mes.</p>}
            </div>
        </div>
    );
};

export default ServiceReasonsChart;