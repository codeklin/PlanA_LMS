'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabaseApi, AuthResponse } from './supabase-api';
import { supabaseClient } from './supabase/client';
import type { Database } from './supabase/client';

type Profile = Database['public']['Tables']['profiles']['Row'];

export interface User extends Profile {}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    role?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const SupabaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const profile = await supabaseApi.getMe();
      setUser(profile);
    } catch (error) {
      console.error('Failed to refresh user', error);
      setUser(null);
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        
        if (session?.user) {
          const profile = await supabaseApi.getMe();
          setUser(profile);
        }
      } catch (error) {
        console.error('Auth initialization failed', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            const profile = await supabaseApi.getMe();
            setUser(profile);
          } catch (error) {
            console.error('Failed to fetch profile', error);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response: AuthResponse = await supabaseApi.login({ email, password });
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  }, []);

  const register = useCallback(
    async (
      firstName: string,
      lastName: string,
      email: string,
      password: string,
      role = 'learner'
    ) => {
      try {
        const response: AuthResponse = await supabaseApi.register({
          firstName,
          lastName,
          email,
          password,
          role: role as any,
        });
        setUser(response.user);
      } catch (error) {
        throw error;
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await supabaseApi.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed', error);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useSupabaseAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};
