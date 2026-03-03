import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import usePermissions from '@/hooks/usePermissions';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();
  const { canManageUsers } = usePermissions();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, role')
        .order('full_name');

      if (error) {
        console.error('Error fetching users:', error);
        toast({ title: 'Error', description: 'No se pudieron cargar los usuarios.', variant: 'destructive' });
      } else {
        setUsers(data);
      }
      setLoading(false);
    };

    if (canManageUsers) fetchUsers();
  }, [canManageUsers]);

  const handleRoleChange = async (userId, newRole) => {
    if (userId === currentUser.id) {
      toast({ title: 'Error', description: 'No puedes cambiar tu propio rol.', variant: 'destructive' });
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      toast({ title: 'Error', description: 'No se pudo actualizar el rol.', variant: 'destructive' });
    } else {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast({ title: 'Rol actualizado', description: `El usuario ahora es ${newRole}.` });
    }
  };

  if (!canManageUsers) return null;
  if (loading) return <p className="text-center py-4">Cargando usuarios...</p>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Gestión de Usuarios</h3>
      <div className="space-y-2">
        {users.map(u => (
          <div key={u.id} className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <div>
              <p className="font-medium">{u.full_name || u.username}</p>
              <p className="text-sm text-slate-500">@{u.username}</p>
            </div>
            <Select
              value={u.role}
              onValueChange={(val) => handleRoleChange(u.id, val)}
              disabled={u.id === currentUser.id}
            >
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="tecnico">Técnico</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserManagement;
