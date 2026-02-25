import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import ServiceOrderCard from '@/components/ServiceOrderCard';

const ServiceOrderGrid = ({ orders, onEditOrder, onDeleteOrder, onViewDetails }) => {
  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.creation_date) - new Date(a.creation_date)),
    [orders]
  );

  return (
    <motion.div
      layout
      className="w-full"
    >
      {sortedOrders.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          <AnimatePresence>
            {sortedOrders.map((order, index) => (
              <ServiceOrderCard
                key={order.id}
                order={order}
                index={index}
                onViewDetails={onViewDetails}
                onEditOrder={onEditOrder}
                onDeleteOrder={onDeleteOrder}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <Search className="h-16 w-16 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-300 mb-2">No se encontraron órdenes de servicio</h3>
          <p className="text-slate-500 dark:text-slate-400">Intenta ajustar tus filtros o crea una nueva orden.</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ServiceOrderGrid;
