import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Mail, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Correo Enviado",
        description: "Revisa tu bandeja de entrada para las instrucciones de reseteo.",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 to-emerald-100 dark:from-slate-900 dark:to-teal-900/70 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-slate-800 shadow-2xl rounded-xl border"
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-teal-500">
            Recuperar Contraseña
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Ingresa tu email para recibir un enlace de recuperación.</p>
        </div>
        <form onSubmit={handlePasswordReset} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full bg-gradient-to-r from-sky-600 to-teal-600 text-white" disabled={loading}>
            {loading ? 'Enviando...' : <><Mail className="mr-2 h-5 w-5" /> Enviar Enlace</>}
          </Button>
        </form>
        <div className="text-center">
          <Link to="/login" className="text-sm font-medium text-sky-600 hover:text-teal-500 dark:text-sky-400 dark:hover:text-teal-400 flex items-center justify-center">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Iniciar Sesión
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;