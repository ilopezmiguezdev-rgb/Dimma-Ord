import { supabase } from '@/lib/customSupabaseClient';
import { toast } from "@/components/ui/use-toast";

export const addClient = async (newClient) => {
  const clientData = {
    id: `client-${Date.now()}`,
    name: newClient.name,
    address: newClient.address
  };
  const { data, error } = await supabase.from('clients').insert([clientData]).select();
  if (error) {
    console.error("Error adding client:", error);
    toast({ title: "Error al agregar cliente", description: error.message, variant: "destructive" });
    return null;
  }
  return data ? data[0] : null;
};

export const getClients = async () => {
  const { data, error } = await supabase.from('clients').select('*');
  if (error) {
    console.error("Error fetching clients:", error);
    toast({ title: "Error al cargar clientes", description: error.message, variant: "destructive" });
    return [];
  }
  return data || [];
};

export const addReagentType = async (newReagentType) => {
  const { data, error } = await supabase.from('reagent_types').insert([{ name: newReagentType.name, sizes: newReagentType.sizes }]).select().single();
  if (error) {
    console.error("Error adding reagent type:", error);
    if (error.code === '23505') { // Unique violation
        toast({ title: "Error: Reactivo ya existe", description: `El tipo de reactivo "${newReagentType.name}" ya está en la lista.`, variant: "destructive" });
    } else {
        toast({ title: "Error al agregar tipo de reactivo", description: error.message, variant: "destructive" });
    }
    return null;
  }
  return data;
};

export const getReagentTypes = async () => {
  const { data, error } = await supabase.from('reagent_types').select('*');
  if (error) {
    console.error("Error fetching reagent types:", error);
    toast({ title: "Error al cargar tipos de reactivos", description: error.message, variant: "destructive" });
    return [];
  }
  return data || [];
};