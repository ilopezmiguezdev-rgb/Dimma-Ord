import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const UpdatePasswordPage = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [recoveryReady, setRecoveryReady] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let cancelled = false;
    let subscription;
    let timeout;

    const init = async () => {
      const hash = window.location.hash;
      console.log('[recovery] hash:', hash);

      const frag = new URLSearchParams(hash.slice(1));
      const accessToken = frag.get('access_token');
      const refreshToken = frag.get('refresh_token');

      if (accessToken && refreshToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        console.log('[recovery] setSession:', { data, error });

        if (!cancelled && data?.session && !error) {
          setRecoveryReady(true);
          return;
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      console.log('[recovery] getSession:', session);
      if (!cancelled && session) {
        setRecoveryReady(true);
        return;
      }

      const { data: { subscription: sub } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          console.log('[recovery] auth event:', event, session);
          if (event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY') {
            setRecoveryReady(true);
          }
        }
      );
      subscription = sub;

      timeout = setTimeout(async () => {
        if (cancelled) return;
        const { data: { session: s2 } } = await supabase.auth.getSession();
        console.log('[recovery] timeout getSession:', s2);
        if (s2) {
          setRecoveryReady(true);
        } else {
          toast({
            title: 'Enlace inválido',
            description: 'El enlace de recuperación no es válido o ha expirado.',
            variant: 'destructive',
          });
          navigate('/login');
        }
      }, 15000);
    };

    init();

    return () => {
      cancelled = true;
      subscription?.unsubscribe();
      clearTimeout(timeout);
    };
  }, [navigate, toast]);

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

  if (!recoveryReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 to-emerald-100 dark:from-slate-900 dark:to-teal-900/70">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Verificando enlace...</p>
        </div>
      </div>
    );
  }

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