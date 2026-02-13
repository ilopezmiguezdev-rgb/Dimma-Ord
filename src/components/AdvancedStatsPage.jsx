import React from 'react';
import { motion } from 'framer-motion';
import MaintenanceCalendar from '@/components/stats/MaintenanceCalendar';
import VisitsByClientChart from '@/components/stats/VisitsByClientChart';
import ServiceReasonsChart from '@/components/stats/ServiceReasonsChart';
import TotalReagentConsumptionChart from '@/components/stats/TotalReagentConsumptionChart';
import ReagentConsumptionByClientChart from '@/components/stats/ReagentConsumptionByClientChart';

const AdvancedStatsPage = ({ serviceOrders, clients, deliveries }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-2 sm:p-4 md:p-6 bg-slate-100/50 dark:bg-slate-900/50"
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div 
                    className="lg:col-span-1" 
                    initial={{ opacity: 0, x: -20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: 0.1 }}
                >
                    <MaintenanceCalendar clients={clients} />
                </motion.div>
                
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: 0.2 }}
                    >
                        <VisitsByClientChart serviceOrders={serviceOrders} />
                    </motion.div>
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: 0.3 }}
                    >
                         <ServiceReasonsChart serviceOrders={serviceOrders} />
                    </motion.div>
                    
                    <motion.div 
                        className="md:col-span-2"
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: 0.4 }}
                    >
                        <TotalReagentConsumptionChart deliveries={deliveries} />
                    </motion.div>
                    
                    <motion.div 
                        className="md:col-span-2"
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: 0.5 }}
                    >
                        <ReagentConsumptionByClientChart deliveries={deliveries} clients={clients} />
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default AdvancedStatsPage;