'use client';

import { useState, useEffect } from 'react';
import AuthPage from '@/components/auth/AuthPage';
import Dashboard from '@/components/dashboard/Dashboard';
import SplashScreen from '@/components/SplashScreen';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const { user, loading } = useAuth();

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // Show splash screen on initial load
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // Show loading state while auth is being determined
  if (loading) {
    console.log('App is loading, user:', user, 'loading:', loading);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
          <p className="text-xs text-gray-500 mt-2">Checking the authentication...</p>
        </div>
      </div>
    );
  }

  // Show auth page if not authenticated
  if (!user) {
    console.log('No user, showing auth page. User:', user);
    return <AuthPage />;
  }

  // Check if email is confirmed - properly handle the email_confirmed_at property
  if (user && user.email_confirmed_at === null) {
    console.log('User exists but email not confirmed yet');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Check your email
          </h2>
          <p className="text-gray-600 mb-6">
            We have sent a confirmation link to <strong>{user.email}</strong>. 
            Click on the link in the email to activate your account.
          </p>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Advice :</strong> Also check your spam folder if you don't see the email.
              </p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              J'ai confirmé mon email
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading while profile is being created (but user exists and email is confirmed)
  if (user && user.email_confirmed_at && !user.profile) {
    console.log('User exists with confirmed email but no profile yet, showing loading...');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Configuring your profile...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg max-w-md">
            <p className="text-xs text-blue-700">
              If it takes longer than expected, try refreshing the page or disconnecting and reconnecting.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show dashboard if authenticated with profile
  console.log('Showing dashboard for user:', user);
  console.log('User role:', user.role?.name);
  return <Dashboard user={user} />;
}