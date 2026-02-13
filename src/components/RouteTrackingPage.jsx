import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapPinned, Building, Navigation, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ClientCard = ({ client, onSelect, isSelected }) => {
  const openInGoogleMaps = (e, address) => {
    e.stopPropagation();
    if (address) {
      const query = encodeURIComponent(address);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      onClick={() => onSelect(client)}
      className={`p-3 rounded-lg cursor-pointer transition-all ease-in-out duration-200 border
        ${isSelected
          ? 'bg-indigo-100 dark:bg-indigo-900/40 border-indigo-500 ring-2 ring-indigo-500'
          : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-400'
        }`}
    >
      <h3 className="font-semibold text-slate-800 dark:text-slate-100 truncate">{client.name}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{client.address}</p>
      <Button 
        variant="link" 
        size="sm" 
        onClick={(e) => openInGoogleMaps(e, client.address)} 
        className="p-0 h-auto text-xs text-indigo-500 hover:text-indigo-400 dark:text-indigo-400 dark:hover:text-indigo-300 mt-1 flex items-center gap-1"
      >
        <Navigation className="h-3 w-3"/>
        Abrir en Google Maps
      </Button>
    </motion.div>
  );
};

const RouteTrackingPage = ({ clients, loading }) => {
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const clientsWithAddress = useMemo(() => 
    (clients || []).filter(c => c.address && c.address.trim() !== ''),
  [clients]);

  const filteredClients = useMemo(() => 
    clientsWithAddress.filter(client =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.address.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  [clientsWithAddress, searchTerm]);

  const mapSrc = useMemo(() => {
    let url = 'https://www.openstreetmap.org/export/embed.html?layer=mapnik';
    let bbox = [-73.9, -55.2, -53.6, -21.8]; // Argentina approx.
    let marker = null;

    if (selectedClient && selectedClient.address) {
        // Since we don't have lat/lon, we can't center perfectly, but we can add a marker.
        // The user will have to manually zoom.
        // A better approach would be geocoding, but that requires an API.
        marker = `search=${encodeURIComponent(selectedClient.address)}`;
    }
    
    // The bbox is quite wide for Argentina. Let's keep it fixed.
    url += `&bbox=${bbox.join(',')}`;

    if (marker) {
      // This is a guess, as embed URL doesn't directly support markers by address query easily.
      // A full maps library would be better here. For now, this will show a pin if OSM can find it.
      // This is more of a search query than a direct marker placement.
      // Let's rely on the user clicking the Google Maps link for accurate navigation.
    }
    
    return url;
  }, [selectedClient]);


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-2 md:p-4 bg-slate-100/50 dark:bg-slate-900/50 backdrop-blur-md shadow-2xl rounded-xl border border-indigo-500/30"
    >
      <header className="mb-6 pb-4 border-b border-indigo-500/30">
        <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 pb-1 flex items-center">
          <MapPinned className="h-8 w-8 mr-3" /> Planificador de Rutas
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Visualiza las ubicaciones de tus clientes y planifica tus visitas.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[65vh]">
        <div className="lg:col-span-5 h-full flex flex-col">
          <div className="flex-shrink-0 mb-3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar cliente por nombre o dirección..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white dark:bg-slate-800"
            />
          </div>
          <div className="flex-grow overflow-y-auto space-y-2 pr-2 styled-scrollbar rounded-lg">
            {loading ? (
              <p className="text-center text-slate-500 dark:text-slate-400 p-4">Cargando clientes...</p>
            ) : filteredClients.length > 0 ? (
              filteredClients.map(client => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onSelect={setSelectedClient}
                  isSelected={selectedClient?.id === client.id}
                />
              ))
            ) : (
              <p className="text-center text-slate-500 dark:text-slate-400 p-4">No se encontraron clientes.</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-7 h-full rounded-xl shadow-lg overflow-hidden border-2 border-indigo-300 dark:border-indigo-700/50">
          <iframe
            key={selectedClient?.id || 'default-map'}
            width="100%"
            height="100%"
            title="OpenStreetMap"
            src={mapSrc}
            className="border-0"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </motion.div>
  );
};

export default RouteTrackingPage;