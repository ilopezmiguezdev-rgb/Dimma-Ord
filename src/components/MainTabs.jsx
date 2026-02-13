import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wrench, Droplets, BarChart3, AlertCircle, MapPinned, HardDrive } from 'lucide-react';
import ServiceOrderGrid from '@/components/ServiceOrderGrid';
import ReagentManagement from '@/components/ReagentManagement';
import AdvancedStatsPage from '@/components/AdvancedStatsPage';
import RemindersPage from '@/components/RemindersPage';
import RouteTrackingPage from '@/components/RouteTrackingPage';
import EquipmentStatusPage from '@/components/EquipmentStatusPage';
import { useLocation } from 'react-router-dom';

const MainTabs = ({
  activeTab,
  setActiveTab,
  loading,
  filteredOrders,
  handleEditOrder,
  handleDeleteOrder,
  handleViewDetails,
  clients,
  serviceOrders,
  deliveries,
  fetchDeliveries,
  equipment,
  reminders,
  onEquipmentUpdate,
  handleClientSelect,
}) => {
  const location = useLocation();

  if (location.pathname.startsWith('/client/')) {
    return null;
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="flex justify-center mb-4 sm:mb-6">
        <TabsList className="bg-slate-200/80 dark:bg-slate-800/70 border border-sky-500/30 p-1 sm:p-1.5 h-auto overflow-x-auto whitespace-nowrap">
          <TabsTrigger value="equipmentStatus" className="data-[state=active]:bg-green-600 data-[state=active]:text-white px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <HardDrive className="h-4 w-4 sm:h-5 sm:w-5 md:mr-2"/> <span className="hidden md:inline">Equipos</span>
          </TabsTrigger>
          <TabsTrigger value="serviceOrders" className="data-[state=active]:bg-sky-600 data-[state=active]:text-white px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <Wrench className="h-4 w-4 sm:h-5 sm:w-5 md:mr-2"/> <span className="hidden md:inline">Órdenes</span>
          </TabsTrigger>
          <TabsTrigger value="reagents" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <Droplets className="h-4 w-4 sm:h-5 sm:w-5 md:mr-2"/> <span className="hidden md:inline">Reactivos</span>
          </TabsTrigger>
          <TabsTrigger value="reminders" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 md:mr-2"/> <span className="hidden md:inline">Alertas</span>
          </TabsTrigger>
          <TabsTrigger value="routeTracking" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <MapPinned className="h-4 w-4 sm:h-5 sm:w-5 md:mr-2"/> <span className="hidden md:inline">Rutas</span>
          </TabsTrigger>
          <TabsTrigger value="advancedStats" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 md:mr-2"/> <span className="hidden md:inline">Stats</span>
          </TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="equipmentStatus">
          <EquipmentStatusPage 
            clients={clients} 
            equipment={equipment} 
            serviceOrders={serviceOrders} 
            deliveries={deliveries}
            reminders={reminders} 
            loading={loading} 
            onEquipmentUpdate={onEquipmentUpdate}
            onClientSelect={handleClientSelect}
          />
       </TabsContent>

      <TabsContent value="serviceOrders">
        {loading ? (
          <div className="text-center py-10 text-lg text-sky-500">Cargando órdenes de servicio...</div>
        ) : (
          <ServiceOrderGrid
            orders={filteredOrders}
            onEditOrder={handleEditOrder}
            onDeleteOrder={handleDeleteOrder}
            onViewDetails={handleViewDetails}
            onOpenAttachmentModal={handleEditOrder}
          />
        )}
      </TabsContent>

      <TabsContent value="reagents">
        <ReagentManagement clients={clients} deliveries={deliveries} fetchDeliveries={fetchDeliveries} />
      </TabsContent>
      <TabsContent value="reminders">
        <RemindersPage clients={clients} equipment={equipment} />
      </TabsContent>
      <TabsContent value="routeTracking">
        <RouteTrackingPage clients={clients} loading={loading} />
      </TabsContent>
      <TabsContent value="advancedStats">
        <AdvancedStatsPage serviceOrders={serviceOrders} clients={clients} deliveries={deliveries} />
      </TabsContent>
    </Tabs>
  );
};

export default MainTabs;