import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { LogIn, Mail, KeyRound } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const logoUrl = "https://i.imgur.com/J4o52p1.png";

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      toast({
        title: "Error de Autenticación",
        description: error.message || "Email o contraseña incorrectos.",
        variant: "destructive",
      });
    } else {
      toast({
        title: `¡Bienvenido de nuevo! 👋`,
        description: "Has iniciado sesión correctamente.",
      });
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 via-teal-50 to-emerald-100 dark:from-slate-900 dark:via-sky-900/50 dark:to-teal-900/70 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-slate-800 shadow-2xl rounded-xl border border-sky-200 dark:border-sky-700"
      >
        <div className="text-center">
          <img src={logoUrl} alt="Servicio Técnico Dimma Logo" className="w-32 h-32 mx-auto mb-6 rounded-full shadow-lg"/>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-teal-500">
            Acceso Dimma
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Inicia sesión para gestionar tus servicios.</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 font-semibold flex items-center">
              <Mail className="mr-2 h-5 w-5 text-sky-500"/> Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="dimma@dimmatec.com"
              required
              className="w-full bg-slate-100 dark:bg-slate-700 border-sky-300 dark:border-sky-600"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 font-semibold flex items-center">
              <KeyRound className="mr-2 h-5 w-5 text-sky-500"/> Contraseña
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-slate-100 dark:bg-slate-700 border-sky-300 dark:border-sky-600"
            />
          </div>
          <div className="text-right text-sm">
            <Link to="/forgot-password" className="font-medium text-sky-600 hover:text-teal-500 dark:text-sky-400 dark:hover:text-teal-400">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <Button type="submit" className="w-full bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-semibold py-3" disabled={loading}>
            {loading ? 'Iniciando...' : <><LogIn className="mr-2 h-5 w-5" /> Iniciar Sesión</>}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;