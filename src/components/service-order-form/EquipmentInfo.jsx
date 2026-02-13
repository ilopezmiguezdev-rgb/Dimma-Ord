import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { HardDrive, Loader2, PlusCircle, Package, Hash, Tag, Type } from 'lucide-react';

const EquipmentInfo = ({ formData, setFormData, clientEquipment, isFetchingEquipment, onAddNewEquipment }) => {
  
  const handleEquipmentChange = (equipmentId) => {
    const selected = clientEquipment.find(e => e.id === equipmentId);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        equipment_id: selected.id,
        equipmentSerial: selected.serial_number,
        equipmentType: selected.equipment_models?.equipment_types?.name || '',
        equipmentBrand: selected.equipment_models?.brand || '',
        equipmentModel: selected.equipment_models?.model_name || '',
        sub_client_id: selected.sub_clients?.id || prev.sub_client_id || null,
        sub_client_name: selected.sub_clients?.name || prev.sub_client_name || '',
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isSelectionDisabled = !formData.client_id;
  const placeholderText = !formData.client_id 
    ? "Seleccione un cliente primero"
    : "Seleccionar equipo...";

  return (
    <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold text-sky-700 dark:text-sky-400 mb-4 flex items-center justify-between">
        <span className="flex items-center"><HardDrive className="mr-2 h-5 w-5"/>Información del Equipo</span>
      </h3>
      
      <div className="space-y-2 mb-4">
        <Label htmlFor="equipment_id">Equipo *</Label>
        <div className="flex items-center gap-2">
            <Select 
              name="equipment_id"
              onValueChange={handleEquipmentChange} 
              disabled={isSelectionDisabled || isFetchingEquipment} 
              value={formData.equipment_id || ''}
            >
                <SelectTrigger>
                  <div className="flex items-center">
                    {isFetchingEquipment && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <SelectValue placeholder={placeholderText} />
                  </div>
                </SelectTrigger>
                <SelectContent>
                    {clientEquipment.length > 0 ? clientEquipment.map(e => (
                        <SelectItem key={e.id} value={e.id}>
                            {e.equipment_models.brand} {e.equipment_models.model_name} (S/N: {e.serial_number})
                        </SelectItem>
                    )) : <p className="p-2 text-sm text-slate-500">No hay equipos para este cliente.</p>}
                </SelectContent>
            </Select>
            <Button type="button" variant="outline" size="icon" onClick={onAddNewEquipment} disabled={isSelectionDisabled} title="Añadir nuevo equipo">
                <PlusCircle className="h-4 w-4" />
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
              <Label className="flex items-center"><Type className="mr-2 h-4 w-4"/>Tipo de Equipo</Label>
              <Input 
                name="equipmentType"
                value={formData.equipmentType || ''} 
                onChange={handleInputChange}
                placeholder="Ej: Analizador"
              />
          </div>
          <div className="space-y-2">
              <Label className="flex items-center"><Tag className="mr-2 h-4 w-4"/>Marca</Label>
              <Input value={formData.equipmentBrand || ''} disabled placeholder="Se autocompleta"/>
          </div>
          <div className="space-y-2">
              <Label className="flex items-center"><Package className="mr-2 h-4 w-4"/>Modelo</Label>
              <Input value={formData.equipmentModel || ''} disabled placeholder="Se autocompleta"/>
          </div>
          <div className="space-y-2">
              <Label className="flex items-center"><Hash className="mr-2 h-4 w-4"/>Número de Serie</Label>
              <Input value={formData.equipmentSerial || ''} disabled placeholder="Se autocompleta"/>
          </div>
      </div>
    </div>
  );
};

export default EquipmentInfo;