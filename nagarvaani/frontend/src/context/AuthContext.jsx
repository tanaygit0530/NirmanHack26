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
      if (session?.user) fetchProfile(session.user.id, session.user.email);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId, userEmail) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      let derivedRole = localStorage.getItem('nagarvaani_demo_role') || null;
      if (userEmail) {
         if (userEmail.includes('admin')) derivedRole = 'admin';
         else if (userEmail.includes('officer')) derivedRole = 'officer';
      }

      if (!error && data) {
        // Force override for demo purposes if email implies higher clearance
        if (derivedRole) data.role = derivedRole;
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
      // Fallback offline role derivation from email structure (useful for testing)
      let fallbackRole = 'citizen';
      if (session?.user?.email) {
        if (session.user.email.includes('admin')) fallbackRole = 'admin';
        else if (session.user.email.includes('officer')) fallbackRole = 'officer';
      }
      setProfile({ id: userId, role: fallbackRole, full_name: fallbackRole === 'citizen' ? 'Citizen' : 'Officer/Admin' });
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    const res = await supabase.auth.signInWithPassword({ email, password });
    if (!res.error && res.data.user) {
      let role = localStorage.getItem('nagarvaani_demo_role') || 'citizen';
      if (email.includes('admin')) role = 'admin';
      else if (email.includes('officer')) role = 'officer';
      // Mock the profile instantly to avoid delays
      setProfile({ id: res.data.user.id, role, full_name: role });
    }
    return res;
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
