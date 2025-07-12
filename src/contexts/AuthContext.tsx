'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthUser, getStoredUser, clearUserSession } from '@/lib/firebase';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  refreshUser: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refreshUser: () => {},
  signOut: () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = () => {
    const storedUser = getStoredUser();
    setUser(storedUser);
  };

  const signOut = () => {
    clearUserSession();
    setUser(null);
  };

  useEffect(() => {
    // Check for stored user session on mount
    refreshUser();
    // Add a small delay to ensure preloader has time to show
    const timer = setTimeout(() => {
      setLoading(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const value = {
    user,
    loading,
    refreshUser,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 