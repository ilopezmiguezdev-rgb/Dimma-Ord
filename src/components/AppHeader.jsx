import React from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, Search, Filter, LogOut, CalendarClock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.jsx";
import { useNavigate } from 'react-router-dom';

const AppHeader = ({ 
  logoUrl,
  onAddNewOrder, 
  searchTerm, 
  onSearchTermChange, 
  statusFilter, 
  onStatusFilterChange, 
  priorityFilter, 
  onPriorityFilterChange,
  dateFilter,
  onDateFilterChange,
  isMainAppScreen,
  profile,
  onLogout
}) => {
  const navigate = useNavigate();

  return (
    <header className="mb-4 sm:mb-8 w-full">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-sky-500/30"
      >
        <div className="flex items-center mb-3 sm:mb-0">
          {logoUrl && <img src={logoUrl} alt="Servicio Técnico Dimma Logo" className="h-10 sm:h-12 md:h-16 mr-2 sm:mr-3 rounded-md"/>}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-500 via-teal-400 to-emerald-400 pb-1 text-center sm:text-left">
            Servicio Técnico Dimma
          </h1>
        </div>
        {profile && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <span className="font-semibold">{profile.full_name || profile.username}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onLogout} className="text-red-500">
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </motion.div>
      
      {isMainAppScreen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-3"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Input
                type="text"
                placeholder="Buscar en todas las órdenes..."
                value={searchTerm}
                onChange={(e) => onSearchTermChange(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800/70 border-sky-500/50 placeholder-gray-500 dark:placeholder-gray-400 text-slate-800 dark:text-white rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-teal-500 focus:border-teal-500"
              />
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            </div>
            <div>
              <Label htmlFor="dateFilter" className="sr-only">Filtrar por Período</Label>
              <Select value={dateFilter} onValueChange={onDateFilterChange}>
                <SelectTrigger className="w-full bg-slate-100 dark:bg-slate-800/70 border-sky-500/50 text-slate-800 dark:text-white rounded-lg py-2 text-sm focus:ring-teal-500 focus:border-teal-500 h-9">
                  <CalendarClock className="inline-block h-3 w-3 mr-1 text-gray-400 dark:text-gray-500" />
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent className="bg-slate-100 dark:bg-slate-800 border-sky-500/50 text-slate-800 dark:text-white">
                  <SelectItem value="this_week">Esta semana</SelectItem>
                  <SelectItem value="this_month">Este mes</SelectItem>
                  <SelectItem value="last_3_months">Últimos 3 meses</SelectItem>
                  <SelectItem value="all">Todas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="statusFilter" className="sr-only">Filtrar por Estado</Label>
              <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                <SelectTrigger className="w-full bg-slate-100 dark:bg-slate-800/70 border-sky-500/50 text-slate-800 dark:text-white rounded-lg py-2 text-sm focus:ring-teal-500 focus:border-teal-500 h-9">
                  <Filter className="inline-block h-3 w-3 mr-1 text-gray-400 dark:text-gray-500" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent className="bg-slate-100 dark:bg-slate-800 border-sky-500/50 text-slate-800 dark:text-white">
                  <SelectItem value="Todos">Todos los Estados</SelectItem>
                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                  <SelectItem value="En Progreso">En Progreso</SelectItem>
                  <SelectItem value="Completada">Completada</SelectItem>
                  <SelectItem value="Cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priorityFilter" className="sr-only">Filtrar por Tipo de Orden</Label>
              <Select value={priorityFilter} onValueChange={onPriorityFilterChange}>
                <SelectTrigger className="w-full bg-slate-100 dark:bg-slate-800/70 border-sky-500/50 text-slate-800 dark:text-white rounded-lg py-2 text-sm focus:ring-teal-500 focus:border-teal-500 h-9">
                  <Filter className="inline-block h-3 w-3 mr-1 text-gray-400 dark:text-gray-500" />
                  <SelectValue placeholder="Tipo de Orden" />
                </SelectTrigger>
                <SelectContent className="bg-slate-100 dark:bg-slate-800 border-sky-500/50 text-slate-800 dark:text-white">
                  <SelectItem value="Todas">Todos los Tipos</SelectItem>
                  <SelectItem value="Service">Service</SelectItem>
                  <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                  <SelectItem value="Visita">Visita</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-center sm:justify-start">
            <Button 
              onClick={onAddNewOrder} 
              className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-4 text-sm rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Nueva Orden
            </Button>
          </div>
        </motion.div>
      )}
    </header>
  );
};

export default AppHeader;