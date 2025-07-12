'use client';

import { useAuth } from '@/contexts/AuthContext';
import AuthForm from './AuthForm';
import UserHeader from './UserHeader';
import { useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, signOut } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  if (loading) {
    return null; // Don't show anything while loading, let the preloader handle it
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto py-8 px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Dev & Debate - Blogging Tool
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Sign in or create an account to access the AI-powered blog generation tool.
            </p>
          </div>
          
          <AuthForm onAuthSuccess={() => setShowAuth(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <UserHeader 
        user={user} 
        onSignOut={signOut} 
      />
      {children}
    </div>
  );
} 