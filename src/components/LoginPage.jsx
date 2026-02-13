import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/toaster';
import { LogIn, User, KeyRound } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const logoUrl = "https://storage.googleapis.com/hostinger-horizons-assets-prod/3ce3d85f-4f57-4c75-9f23-346da62300fc/85b11566902563bbbd110f9a27abcb49.jpg";

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const email = `${username.toLowerCase()}@dimma.com`;

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Error de Autenticación",
        description: "Nombre de usuario o contraseña incorrectos.",
        variant: "destructive",
      });
    } else if (data.session) {
      toast({
        title: `¡Bienvenido, ${username}! 👋`,
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
            Servicio Técnico Dimma
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Por favor, inicia sesión para continuar.</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-slate-700 dark:text-slate-300 font-semibold flex items-center">
              <User className="mr-2 h-5 w-5 text-sky-500"/> Nombre de Usuario
            </Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Javier o Cynthia"
              required
              className="w-full bg-slate-100 dark:bg-slate-700 border-sky-300 dark:border-sky-600 placeholder-slate-400 dark:placeholder-slate-500 text-slate-800 dark:text-white rounded-lg focus:ring-teal-500 focus:border-teal-500"
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
              placeholder="Tu nombre de usuario"
              required
              className="w-full bg-slate-100 dark:bg-slate-700 border-sky-300 dark:border-sky-600 placeholder-slate-400 dark:placeholder-slate-500 text-slate-800 dark:text-white rounded-lg focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <Button type="submit" className="w-full bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" disabled={loading}>
            {loading ? 'Iniciando...' : <><LogIn className="mr-2 h-5 w-5" /> Iniciar Sesión</>}
          </Button>
        </form>
        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} Dimma Technology. Todos los derechos reservados.
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;