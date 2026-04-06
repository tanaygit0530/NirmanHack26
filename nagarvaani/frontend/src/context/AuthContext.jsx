import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (!error && data) {
        setProfile(data);
      } else {
        // If data is null or error, try to create or just use a local default for the session
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{ id: userId, role: 'citizen', full_name: 'Citizen' }])
          .select()
          .single();
        
        if (!createError && newProfile) {
          setProfile(newProfile);
        } else {
          // Absolute fallback: Set a local citizen profile so they aren't stuck
          setProfile({ id: userId, role: 'citizen', full_name: 'Identified Citizen' });
        }
      }
    } catch (err) {
      console.error('Error fetching profile', err);
      // Fail safely to citizen role
      setProfile({ id: userId, role: 'citizen', full_name: 'Citizen' });
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signUp = async (email, password, fullName) => {
    const res = await supabase.auth.signUp({ email, password });
    if (res.data.user) {
      // Create profile
      await supabase.from('profiles').insert([
        { id: res.data.user.id, full_name: fullName, role: 'citizen' }
      ]);
      // Also might want to immediately set role locally, but profile fetch will handle it eventually.
    }
    return res;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      signIn,
      signUp,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
