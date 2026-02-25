import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { UserPlus, Mail, KeyRound, User } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const SignUpPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const logoUrl = "https://storage.googleapis.com/hostinger-horizons-assets-prod/3ce3d85f-4f57-4c75-9f23-346da62300fc/85b11566902563bbbd110f9a27abcb49.jpg";

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: fullName,
        },
      },
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Error en el Registro",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "¡Registro Exitoso!",
        description: "Por favor, revisa tu email para confirmar tu cuenta.",
      });
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 via-teal-50 to-emerald-100 dark:from-slate-900 dark:via-sky-900/50 dark:to-teal-900/70 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-slate-800 shadow-2xl rounded-xl border border-sky-200 dark:border-sky-700"
      >
        <div className="text-center">
          <img src={logoUrl} alt="Servicio Técnico Dimma Logo" className="w-24 h-24 mx-auto mb-4 rounded-full shadow-lg"/>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-teal-500">
            Crear Cuenta
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Únete a la plataforma Dimma.</p>
        </div>
        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nombre Completo</Label>
            <Input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Nombre de Usuario</Label>
            <Input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full bg-gradient-to-r from-sky-600 to-teal-600 text-white" disabled={loading}>
            {loading ? 'Registrando...' : <><UserPlus className="mr-2 h-5 w-5" /> Registrarse</>}
          </Button>
        </form>
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="font-medium text-sky-600 hover:text-teal-500 dark:text-sky-400 dark:hover:text-teal-400">
            Inicia sesión
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default SignUpPage;