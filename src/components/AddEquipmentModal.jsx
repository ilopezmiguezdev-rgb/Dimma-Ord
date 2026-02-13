import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/toaster";
import { supabase } from '@/lib/customSupabaseClient';
import { PlusCircle, Loader2 } from 'lucide-react';

const AddEquipmentModal = ({ isOpen, onClose, onEquipmentAdded, clients, subClients, preselectedClientId, preselectedSubClientId }) => {
    const [equipmentTypes, setEquipmentTypes] = useState([]);
    
    const [selectedClientId, setSelectedClientId] = useState('');
    const [selectedSubClientId, setSelectedSubClientId] = useState('');
    const [serialNumber, setSerialNumber] = useState('');
    const [installationDate, setInstallationDate] = useState('');
    
    const [isLoading, setIsLoading] = useState(false);
    const [isAddingType, setIsAddingType] = useState(false);

    const [brand, setBrand] = useState('');
    const [modelName, setModelName] = useState('');
    const [typeId, setTypeId] = useState('');
    const [newTypeName, setNewTypeName] = useState('');
    
    useEffect(() => {
        if (isOpen) {
            setSelectedClientId(preselectedClientId || '');
            setSelectedSubClientId(preselectedSubClientId || '');
            const fetchInitialData = async () => {
                const { data, error } = await supabase.from('equipment_types').select('*').order('name');
                if (error) console.error('Error fetching types', error);
                else setEquipmentTypes(data);
            };
            fetchInitialData();
        }
    }, [isOpen, preselectedClientId, preselectedSubClientId]);
    
    useEffect(() => {
        if(selectedClientId !== preselectedClientId) {
             setSelectedSubClientId('');
        }
    }, [selectedClientId, preselectedClientId]);

    const resetForm = () => {
        setSelectedClientId('');
        setSelectedSubClientId('');
        setSerialNumber('');
        setInstallationDate('');
        setIsAddingType(false);
        setBrand('');
        setModelName('');
        setTypeId('');
        setNewTypeName('');
    };
    
    const handleAddType = async () => {
        if (!newTypeName) {
            toast({ title: "Error", description: "El nombre del tipo es requerido.", variant: "destructive" });
            return;
        }
        setIsLoading(true);
        const { data, error } = await supabase.from('equipment_types').insert([{ name: newTypeName }]).select().single();
        setIsLoading(false);

        if (error) {
            toast({ title: "Error", description: "No se pudo agregar el tipo. Puede que ya exista.", variant: "destructive" });
        } else {
            toast({ title: "Éxito", description: "Nuevo tipo de equipo agregado." });
            setEquipmentTypes(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
            setTypeId(data.id);
            setIsAddingType(false);
            setNewTypeName('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedClientId || !typeId || !brand || !modelName || !serialNumber) {
            toast({ title: "Error de validación", description: "Todos los campos marcados con * son obligatorios.", variant: "destructive" });
            return;
        }
        setIsLoading(true);

        // 1. Upsert Model
        const { data: modelData, error: modelError } = await supabase
            .from('equipment_models')
            .upsert({ type_id: typeId, brand, model_name: modelName }, { onConflict: 'type_id,brand,model_name', ignoreDuplicates: false })
            .select()
            .single();

        if (modelError) {
            setIsLoading(false);
            toast({ title: "Error", description: "No se pudo guardar el modelo del equipo.", variant: "destructive" });
            return;
        }

        // 2. Insert Equipment
        const payload = {
            client_id: selectedClientId,
            sub_client_id: selectedSubClientId || null,
            model_id: modelData.id,
            serial_number: serialNumber,
            installation_date: installationDate || new Date().toISOString().split('T')[0],
        };
        const { data: newEquipment, error: equipmentError } = await supabase.from('equipment_inventory').insert([payload]).select('*, equipment_models(*, equipment_types(*)), sub_clients(id, name)').single();
        setIsLoading(false);

        if (equipmentError) {
            toast({ title: "Error", description: "No se pudo agregar el equipo. Verifique que el N/S no esté duplicado.", variant: "destructive" });
        } else {
            toast({ title: "Éxito", description: "Equipo agregado al inventario." });
            onEquipmentAdded(newEquipment);
            onClose();
        }
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
            <DialogContent className="sm:max-w-md bg-white dark:bg-slate-800">
                <DialogHeader>
                    <DialogTitle>Añadir Nuevo Equipo al Inventario</DialogTitle>
                    <DialogDescription>Complete todos los detalles del equipo. Se creará el modelo si no existe.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2 styled-scrollbar">
                    <div>
                        <Label htmlFor="client">Cliente *</Label>
                        <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                            <SelectTrigger><SelectValue placeholder="Seleccionar cliente" /></SelectTrigger>
                            <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="subclient">Laboratorio / Clínica (Opcional)</Label>
                        <Select value={selectedSubClientId} onValueChange={setSelectedSubClientId} disabled={!selectedClientId}>
                            <SelectTrigger><SelectValue placeholder="Seleccionar laboratorio" /></SelectTrigger>
                            <SelectContent>
                                {Array.isArray(subClients) && subClients.map(sc => <SelectItem key={sc.id} value={sc.id}>{sc.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    {!isAddingType ? (
                        <div>
                            <Label htmlFor="typeId">Tipo de Equipo *</Label>
                            <div className="flex items-center gap-2">
                                <Select value={typeId} onValueChange={setTypeId}>
                                    <SelectTrigger><SelectValue placeholder="Seleccionar tipo" /></SelectTrigger>
                                    <SelectContent>{equipmentTypes.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                                </Select>
                                <Button type="button" variant="outline" size="icon" onClick={() => setIsAddingType(true)} title="Añadir nuevo tipo">
                                    <PlusCircle className="h-4 w-4"/>
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-2 border rounded-md space-y-2 bg-slate-100 dark:bg-slate-600/50">
                            <Label htmlFor="newTypeName">Nuevo Tipo de Equipo</Label>
                            <Input id="newTypeName" placeholder="Ej: Analizador" value={newTypeName} onChange={e => setNewTypeName(e.target.value)} />
                            <div className="flex gap-2">
                                <Button type="button" size="sm" onClick={handleAddType} disabled={isLoading}>
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : "Guardar Tipo"}
                                </Button>
                                <Button type="button" size="sm" variant="ghost" onClick={() => setIsAddingType(false)}>Cancelar</Button>
                            </div>
                        </div>
                    )}

                    <div>
                        <Label htmlFor="brand">Marca *</Label>
                        <Input id="brand" placeholder="Ej: Siemens" value={brand} onChange={e => setBrand(e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="modelName">Nombre del Modelo *</Label>
                        <Input id="modelName" placeholder="Ej: Atellica" value={modelName} onChange={e => setModelName(e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="serial">Número de Serie *</Label>
                        <Input id="serial" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} placeholder="Ej: SN12345678" />
                    </div>
                    <div>
                        <Label htmlFor="installation_date">Fecha de Instalación</Label>
                        <Input id="installation_date" type="date" value={installationDate} onChange={(e) => setInstallationDate(e.target.value)} />
                    </div>
                </form>
                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : "Guardar Equipo"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddEquipmentModal;