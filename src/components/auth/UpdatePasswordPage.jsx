import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { KeyRound, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const UpdatePasswordPage = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session } = useAuth();

  useEffect(() => {
    if (!session) {
      // This logic handles the case where the user is already logged in
      // from the password recovery link.
      const hash = window.location.hash;
      if (!hash.includes('access_token')) {
        toast({ title: "Enlace inválido", description: "El enlace de recuperación de contraseña no es válido o ha expirado.", variant: "destructive" });
        navigate('/login');
      }
    }
  }, [session, navigate, toast]);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      toast({
        title: "Error al actualizar",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Contraseña Actualizada",
        description: "Tu contraseña ha sido cambiada exitosamente. Por favor, inicia sesión.",
      });
      await supabase.auth.signOut();
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 to-emerald-100 dark:from-slate-900 dark:to-teal-900/70 p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-slate-800 shadow-2xl rounded-xl border"
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-teal-500">
            Actualizar Contraseña
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Ingresa tu nueva contraseña.</p>
        </div>
        <form onSubmit={handleUpdatePassword} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="password">Nueva Contraseña</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full bg-gradient-to-r from-sky-600 to-teal-600 text-white" disabled={loading}>
            {loading ? 'Actualizando...' : <><CheckCircle className="mr-2 h-5 w-5" /> Guardar Contraseña</>}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default UpdatePasswordPage;