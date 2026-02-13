import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const getProfile = useCallback(async (user) => {
    if (!user) return null;
    try {
      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username, full_name, avatar_url`)
        .eq('id', user.id)
        .single();
      if (error && status !== 406) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error.message);
      return null;
    }
  }, []);

  const handleAuthChange = useCallback(async (session) => {
    const currentUser = session?.user;
    setSession(session);
    setUser(currentUser ?? null);

    if (currentUser) {
      const userProfile = await getProfile(currentUser);
      setProfile(userProfile);
    } else {
      setProfile(null);
    }
    setLoading(false);
  }, [getProfile]);


  useEffect(() => {
    const fetchInitialSession = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      await handleAuthChange(initialSession);
    };

    fetchInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      await handleAuthChange(session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [handleAuthChange]);

  const value = {
    session,
    user,
    profile,
    loading,
    signOut: () => supabase.auth.signOut(),
    refreshProfile: async () => {
      if (user) {
        const userProfile = await getProfile(user);
        setProfile(userProfile);
      }
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};