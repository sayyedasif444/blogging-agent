'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { createUser, signInUser, storeUserSession } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { countryCodes } from './countryCodes';

interface AuthFormProps {
  onAuthSuccess: () => void;
}

export default function AuthForm({ onAuthSuccess }: AuthFormProps) {
  const { refreshUser } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; phone?: string }>({});
  const [countryCode, setCountryCode] = useState('+91');

  // Phone number validation function
  const validatePhone = (phone: string): boolean => {
    // Remove all non-digit characters except + for international format
    const cleanPhone = phone.replace(/[^ -9+]/g, '');
    
    // Check for valid phone number patterns
    const phoneRegex = /^\+\d{10,15}$/;
    
    if (!phoneRegex.test(cleanPhone)) {
      return false;
    }
    
    // Remove + and check if it's at least 10 digits
    const digitsOnly = cleanPhone.replace(/\+/g, '');
    return digitsOnly.length >= 10;
  };

  // Form validation
  const validateForm = () => {
    const errors: { email?: string; password?: string; phone?: string } = {};

    // Email validation
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!password.trim()) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }

    // Phone validation (only for signup)
    if (!isLogin) {
      const fullPhone = countryCode + phone.trim();
      if (!phone.trim()) {
        errors.phone = 'Phone number is required';
      } else if (!validatePhone(fullPhone)) {
        errors.phone = 'Please enter a valid phone number with country code (e.g., +91XXXXXXXXXX)';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      let user;
      if (isLogin) {
        user = await signInUser(email, password);
      } else {
        const fullPhone = countryCode + phone.trim();
        user = await createUser(email, password, fullPhone);
      }
      
      // Store user session in localStorage
      storeUserSession(user);
      
      // Refresh the auth context
      refreshUser();
      
      // Trigger auth success callback
      onAuthSuccess();
    } catch (error: any) {
      console.error('Auth error:', error);
      setError(error.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleModeToggle = () => {
    setIsLogin(!isLogin);
    setError('');
    setFieldErrors({});
    setPhone(''); // Clear phone when switching modes
  };

  return (
    <div className="max-w-md mx-auto bg-gray-900 rounded-lg p-8 border border-gray-700">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-gray-400">
          {isLogin ? 'Sign in to access the blog tool' : 'Sign up to get started with 2 free credits'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
            Email <span className="text-red-400">*</span>
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) {
                setFieldErrors(prev => ({ ...prev, email: undefined }));
              }
            }}
            required
            className={`w-full px-3 py-2 bg-gray-800 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              fieldErrors.email ? 'border-red-500' : 'border-gray-600'
            }`}
            placeholder="Enter your email"
          />
          {fieldErrors.email && (
            <p className="text-red-400 text-sm mt-1">{fieldErrors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
            Password <span className="text-red-400">*</span>
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) {
                setFieldErrors(prev => ({ ...prev, password: undefined }));
              }
            }}
            required
            minLength={6}
            className={`w-full px-3 py-2 bg-gray-800 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              fieldErrors.password ? 'border-red-500' : 'border-gray-600'
            }`}
            placeholder="Enter your password"
          />
          {fieldErrors.password && (
            <p className="text-red-400 text-sm mt-1">{fieldErrors.password}</p>
          )}
        </div>

        {!isLogin && (
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
              Phone Number <span className="text-red-400">*</span>
            </label>
            <div className="flex">
              <select
                value={countryCode}
                onChange={e => setCountryCode(e.target.value)}
                className="px-2 py-2 bg-gray-800 border border-gray-600 rounded-l-md text-white focus:outline-none"
              >
                {countryCodes.map(({ code, name }) => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (fieldErrors.phone) {
                    setFieldErrors(prev => ({ ...prev, phone: undefined }));
                  }
                }}
                required
                className={`w-full px-3 py-2 bg-gray-800 border-t border-b border-r rounded-r-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  fieldErrors.phone ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="XXXXXXXXXX"
              />
            </div>
            {fieldErrors.phone && (
              <p className="text-red-400 text-sm mt-1">{fieldErrors.phone}</p>
            )}
          </div>
        )}

        {error && (
          <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-md p-3">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-400">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={handleModeToggle}
            className="text-blue-400 hover:text-blue-300 font-medium"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>

      {!isLogin && (
        <div className="mt-4 p-4 bg-blue-900/20 border border-blue-800 rounded-md">
          <h3 className="text-blue-400 font-semibold mb-2">Free Trial</h3>
          <p className="text-sm text-gray-300">
            New users get 2 free blog generations per day. Credits reset every 24 hours.
          </p>
        </div>
      )}
    </div>
  );
} 