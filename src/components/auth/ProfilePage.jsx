import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { User, Save } from 'lucide-react';

const ProfilePage = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setUsername(profile.username || '');
    }
  }, [profile]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    const updates = {
      id: user.id,
      full_name: fullName,
      username,
      updated_at: new Date(),
    };

    const { error } = await supabase.from('profiles').upsert(updates);

    setLoading(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Perfil Actualizado", description: "Tu información ha sido guardada." });
      refreshProfile();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8"
    >
      <div className="bg-card p-8 rounded-lg shadow-lg border">
        <h1 className="text-3xl font-bold text-primary mb-2 flex items-center">
          <User className="mr-3 h-8 w-8" />
          Mi Perfil
        </h1>
        <p className="text-muted-foreground mb-6">Gestiona tu información personal.</p>
        
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={user?.email || ''} disabled className="bg-muted/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullName">Nombre Completo</Label>
            <Input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Nombre de Usuario</Label>
            <Input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          
          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : <><Save className="mr-2 h-4 w-4" /> Guardar Cambios</>}
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default ProfilePage;