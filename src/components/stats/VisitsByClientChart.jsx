import React, { useMemo, useState } from 'react';
import { Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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

const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 text-sm bg-background/80 backdrop-blur-sm border rounded-lg shadow-lg">
                <p className="font-bold">{`${payload[0].name}`}</p>
                <p className="text-primary">{`Visitas: ${payload[0].value}`}</p>
            </div>
        );
    }
    return null;
};


const VisitsByClientChart = ({ serviceOrders }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const visitsByClient = useMemo(() => {
        const start = startOfMonth(currentMonth);
        const end = endOfMonth(currentMonth);
        const visitCounts = serviceOrders
            .filter(order => order.creation_date && isWithinInterval(parseISO(order.creation_date), { start, end }))
            .reduce((acc, order) => {
                if (order.client_name) {
                    acc[order.client_name] = (acc[order.client_name] || 0) + 1;
                }
                return acc;
            }, {});

        return Object.entries(visitCounts).map(([name, visits]) => ({ name, value: visits }));
    }, [serviceOrders, currentMonth]);

    return (
        <div className="bg-white dark:bg-slate-800/60 p-4 rounded-xl shadow-lg border border-purple-500/20 h-full">
            <header className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-purple-700 dark:text-purple-300 flex items-center">
                    <Users className="h-6 w-6 mr-3 text-purple-500" /> Visitas por Cliente
                </h2>
                <MonthNavigator currentMonth={currentMonth} onPrev={() => setCurrentMonth(m => subMonths(m, 1))} onNext={() => setCurrentMonth(m => addMonths(m, 1))} />
            </header>
            <div className="h-64 w-full">
                {visitsByClient.length > 0 ? (
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie data={visitsByClient} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
                                const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                                const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                                return <text x={x} y={y} fill="currentColor" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-semibold">{`${(percent * 100).toFixed(0)}%`}</text>;
                            }}>
                                {visitsByClient.map((entry, index) => <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                            </Pie>
                            <Tooltip content={<CustomPieTooltip />} />
                            <Legend iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                ) : <p className="text-center pt-20 text-slate-500">Sin visitas en este mes.</p>}
            </div>
        </div>
    );
};

export default VisitsByClientChart;