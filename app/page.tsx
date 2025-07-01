'use client';

import { useState, useEffect } from 'react';
import AuthPage from '@/components/auth/AuthPage';
import Dashboard from '@/components/dashboard/Dashboard';
import SplashScreen from '@/components/SplashScreen';
import DatabaseTestPanel from '@/components/DatabaseTestPanel';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Database, X } from 'lucide-react';

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [showDatabaseTest, setShowDatabaseTest] = useState(false);
  const { user, loading } = useAuth();

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // Show splash screen on initial load
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // Show database test panel if requested
  if (showDatabaseTest) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Database Configuration Test</h1>
            <Button 
              variant="outline" 
              onClick={() => setShowDatabaseTest(false)}
            >
              <X className="w-4 h-4 mr-2" />
              Close Test Panel
            </Button>
          </div>
          <DatabaseTestPanel />
        </div>
      </div>
    );
  }

  // Show loading state while auth is being determined
  if (loading) {
    console.log('App is loading, user:', user, 'loading:', loading);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
          <p className="text-xs text-gray-500 mt-2">Checking authentication...</p>
          
          {/* Database Test Button */}
          <div className="mt-6">
            <Button 
              variant="outline" 
              onClick={() => setShowDatabaseTest(true)}
              className="text-xs"
            >
              <Database className="w-4 h-4 mr-2" />
              Run Database Test
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show auth page if not authenticated
  if (!user) {
    console.log('No user, showing auth page. User:', user);
    return (
      <div className="relative">
        <AuthPage />
        
        {/* Database Test Button - Fixed position */}
        <div className="fixed bottom-4 right-4 z-50">
          <Button 
            variant="outline" 
            onClick={() => setShowDatabaseTest(true)}
            className="shadow-lg bg-white hover:bg-gray-50"
          >
            <Database className="w-4 h-4 mr-2" />
            Database Test
          </Button>
        </div>
      </div>
    );
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
                <strong>Tip:</strong> Also check your spam folder if you don't see the email.
              </p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              I have confirmed my email
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading while profile is being created (but user exists and email is confirmed)
  if (user && user.email_confirmed_at && !user.profile) {
    console.log('User exists with confirmed email but no profile yet, attempting to create...');
    
    // The profile creation is now handled automatically in getUserProfile
    // This loading state should be brief as the profile gets created automatically
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up your profile...</p>
          <p className="text-sm text-gray-500 mt-2">Creating your account profile</p>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg max-w-md">
            <p className="text-xs text-blue-700 mb-3">
              We're automatically creating your profile. This should only take a moment.
            </p>
            <div className="space-y-2">
              <button 
                onClick={() => window.location.reload()}
                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors mr-2"
              >
                Refresh if stuck
              </button>
              <button 
                onClick={() => setShowDatabaseTest(true)}
                className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
              >
                Run Database Test
              </button>
            </div>
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