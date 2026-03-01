'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
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
  ) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Global flag to prevent multiple initializations across component remounts
let globalInitialized = false;
let globalAuthSubscription: any = null;

export const SupabaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);
  const initializingRef = useRef(false);

  const refreshUser = useCallback(async () => {
    try {
      const profile = await supabaseApi.getMe();
      if (mountedRef.current) {
        setUser(profile);
      }
    } catch (error) {
      console.error('Failed to refresh user', error);
      if (mountedRef.current) {
        setUser(null);
      }
    }
  }, []);

  // Initialize auth state only once globally
  useEffect(() => {
    mountedRef.current = true;

    const initializeAuth = async () => {
      // Prevent multiple initializations
      if (globalInitialized || initializingRef.current) {
        setIsLoading(false);
        return;
      }

      initializingRef.current = true;

      try {
        // Small delay to handle React Strict Mode double mounting
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (!mountedRef.current) return;

        const { data: { session } } = await supabaseClient.auth.getSession();
        
        if (!mountedRef.current) return;

        if (session?.user) {
          try {
            const profile = await supabaseApi.getMe();
            if (mountedRef.current) {
              setUser(profile);
            }
          } catch (error) {
            console.error('Failed to fetch profile', error);
            if (mountedRef.current) {
              setUser(null);
            }
          }
        }

        // Set up auth state listener only once
        if (!globalAuthSubscription) {
          const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
            async (event, session) => {
              console.log('Auth event:', event);
              
              if (event === 'SIGNED_IN' && session?.user) {
                try {
                  const profile = await supabaseApi.getMe();
                  if (mountedRef.current) {
                    setUser(profile);
                  }
                } catch (error) {
                  console.error('Failed to fetch profile', error);
                }
              } else if (event === 'SIGNED_OUT') {
                if (mountedRef.current) {
                  setUser(null);
                }
              } else if (event === 'TOKEN_REFRESHED' && session?.user) {
                try {
                  const profile = await supabaseApi.getMe();
                  if (mountedRef.current) {
                    setUser(profile);
                  }
                } catch (error) {
                  console.error('Failed to refresh profile', error);
                }
              }
            }
          );
          
          globalAuthSubscription = subscription;
        }

        globalInitialized = true;
      } catch (error) {
        console.error('Auth initialization failed', error);
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
        initializingRef.current = false;
      }
    };

    initializeAuth();

    return () => {
      mountedRef.current = false;
      // Don't unsubscribe on unmount to prevent issues with React Strict Mode
      // The subscription will persist across remounts
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response: AuthResponse = await supabaseApi.login({ email, password });
      if (mountedRef.current) {
        setUser(response.user);
      }
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
    ): Promise<AuthResponse> => {
      try {
        const response: AuthResponse = await supabaseApi.register({
          firstName,
          lastName,
          email,
          password,
          role: role as any,
        });
        
        // Only set user if session exists (email confirmation disabled)
        if (response.session && mountedRef.current) {
          setUser(response.user);
        }
        
        return response;
      } catch (error) {
        throw error;
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await supabaseApi.logout();
      if (mountedRef.current) {
        setUser(null);
      }
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
