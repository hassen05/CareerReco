import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let unsubscribe = null;
    const PUBLIC_ROUTES = [
      '/login',
      '/signup',
      '/signup/candidate',
      '/signup/recruiter',
      '/forgot-password',
      '/reset-password',
      '/about',
      '/',
      '/logo-preview',
    ];
    const isPublicRoute = (pathname) =>
      PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'));
    const initializeAuth = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        setLoading(false);

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
            if ((event === 'SIGNED_OUT' || !session) && !isPublicRoute(window.location.pathname)) {
              setSessionExpired(true);
              navigate('/login', { replace: true, state: { sessionExpired: true } });
            }
          }
        );
        unsubscribe = subscription;
      } catch (error) {
        console.error('Error initializing auth:', error);
        setLoading(false);
      }
    };
    initializeAuth();
    return () => {
      unsubscribe?.unsubscribe();
    };
  }, [navigate]);

  const value = {
    user,
    loading,
    sessionExpired
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 