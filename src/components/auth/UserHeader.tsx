'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { getUserData, UserData, clearUserSession } from '@/lib/firebase';
import { AuthUser } from '@/lib/firebase';
import Link from 'next/link';
import { getCreditsFromLocalStorage } from '@/lib/utils';

interface UserHeaderProps {
  user: AuthUser;
  onSignOut: () => void;
}

export default function UserHeader({ user, onSignOut }: UserHeaderProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/credit-status?email=${encodeURIComponent(user.email)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUserData({
            email: data.user.email,
            password: '', // Not needed for display
            phone: '', // Not needed for display
            freeCredits: data.user.credits.free,
            purchasedCredits: data.user.credits.purchased,
            resetTime: data.user.nextResetTime ? new Date(data.user.nextResetTime) : new Date(),
            lastFreeCreditReset: data.user.lastFreeCreditReset,
            lastUpdated: data.user.lastUpdated,
            createdAt: new Date(), // Default value
            lastLoginAt: new Date() // Default value
          });
        }
      } else {
        // Fallback to old method if credit-status fails
        const data = await getUserData(user.email);
        setUserData(data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Fallback to old method
      try {
        const data = await getUserData(user.email);
        setUserData(data);
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to update credits from localStorage
  const updateCreditsFromLocalStorage = () => {
    try {
      const creditsData = getCreditsFromLocalStorage();
      if (creditsData && userData) {
        setUserData({
          ...userData,
          freeCredits: creditsData.freeCredits,
          purchasedCredits: creditsData.purchasedCredits
        });
      }
    } catch (error) {
      console.error('Error reading credits from localStorage:', error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [user.email]);

  // Refresh credits every 30 seconds to keep them updated
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUserData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user.email]);

  // Listen for storage events (when credits are updated from other parts of the app)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'credits_updated' && e.newValue) {
        updateCreditsFromLocalStorage();
        localStorage.removeItem('credits_updated');
      }
    };

    // Listen for custom storage events (same tab)
    const handleCustomStorageChange = () => {
      updateCreditsFromLocalStorage();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('creditsUpdated', handleCustomStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('creditsUpdated', handleCustomStorageChange);
    };
  }, [userData]);

  const handleSignOut = async () => {
    try {
      onSignOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const formatResetTime = (resetTime: Date) => {
    const now = new Date();
    const timeDiff = resetTime.getTime() - now.getTime();
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="bg-gray-900 border-b border-gray-700 p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {user.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-white font-medium">{user.email}</p>
            {loading ? (
              <p className="text-gray-400 text-sm">Loading credits...</p>
            ) : userData ? (
              <div className="flex items-center space-x-4 text-sm">
                <span className="text-gray-300">
                  Credits: <span className="text-blue-400 font-semibold">
                    {userData.freeCredits + (userData.purchasedCredits || 0)}
                  </span>
                </span>
                <span className="text-gray-400">
                  Resets in: {formatResetTime(userData.resetTime instanceof Date ? userData.resetTime : new Date((userData.resetTime as any).seconds * 1000))}
                </span>
              </div>
            ) : (
              <p className="text-red-400 text-sm">Error loading user data</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link href="/pricing">
            <Button 
              variant="outline" 
              className="text-white border-gray-600 hover:bg-gray-800"
            >
              Buy Credits
            </Button>
          </Link>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="text-white border-gray-600 hover:bg-gray-800"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
} 