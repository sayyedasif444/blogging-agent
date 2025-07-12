'use client';

import Link from 'next/link';
import Image from 'next/image';
import BackgroundPattern from '@/components/ui/BackgroundPattern';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import PhoneMigrationModal from '@/components/auth/PhoneMigrationModal';
import { useState, useEffect } from 'react';

export default function Home() {
  const { user, loading } = useAuth();
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [checkingPhone, setCheckingPhone] = useState(false);

  // Check if user needs phone number migration
  useEffect(() => {
    const checkUserPhone = async () => {
      if (user && !loading) {
        setCheckingPhone(true);
        try {
          const response = await fetch('/api/get-user-data', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userEmail: user.email }),
          });

          if (response.ok) {
            const data = await response.json();
            // Show modal if user doesn't have phone number
            if (!data.userData.phone) {
              setShowPhoneModal(true);
            }
          }
        } catch (error) {
          console.error('Error checking user phone:', error);
        } finally {
          setCheckingPhone(false);
        }
      }
    };

    checkUserPhone();
  }, [user, loading]);

  const handlePhoneAdded = (phone: string) => {
    console.log('Phone number added:', phone);
    // You could refresh user data here if needed
  };

  return (
    <div className="min-h-screen bg-black text-white relative">
      <BackgroundPattern />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Image
                src="/images/logo-main.png"
                alt="Dev & Debate Logo"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <h1 className="text-2xl font-bold text-white">Dev & Debate</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {!loading && (
                <>
                  {user ? (
                    <div className="flex items-center space-x-4">
                      <span className="text-gray-300">Welcome, {user.email}</span>
                      <Link href="/blog-tool">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                          Go to Blog Tool
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <Link href="/blog-tool">
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        Sign In / Sign Up
                      </Button>
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center py-20 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center mb-8">
            <Image
              src="/images/logo-main.png"
              alt="Dev & Debate Logo"
              width={120}
              height={120}
              className="rounded-lg"
            />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Dev & Debate
          </h1>
          <h2 className="text-3xl md:text-4xl font-semibold text-blue-400 mb-6">
            Blogging Tool
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Transform your ideas into well-written blog posts in seconds. 
            Powered by advanced AI to help you create engaging content effortlessly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/blog-tool"
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-lg"
            >
              {user ? 'Start Creating' : 'Sign In to Start'}
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center px-8 py-4 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors text-lg"
            >
              View Pricing
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-white mb-12">
              Why Choose Our AI Blog Creator?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Lightning Fast</h3>
                <p className="text-gray-400">
                  Generate complete blog posts in seconds, not hours. Save time and focus on what matters.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Smart & Customizable</h3>
                <p className="text-gray-400">
                  Choose your tone, length, and style. Our AI adapts to your needs and preferences.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Secure & Private</h3>
                <p className="text-gray-400">
                  Your content is yours. Download in multiple formats and keep full control of your work.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Create Amazing Content?
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Join thousands of creators who are already using AI to enhance their writing.
            </p>
            <Link
              href="/blog-tool"
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-lg"
            >
              {user ? 'Start Creating' : 'Get Started for Free'}
            </Link>
            <p className="text-sm text-gray-400 mt-4">
              2 free blogs per day • No credit card required
            </p>
          </div>
        </div>
      </div>

      {/* Phone Migration Modal */}
      {user && (
        <PhoneMigrationModal
          userEmail={user.email}
          isOpen={showPhoneModal}
          onClose={() => setShowPhoneModal(false)}
          onPhoneAdded={handlePhoneAdded}
        />
      )}
    </div>
  );
}
