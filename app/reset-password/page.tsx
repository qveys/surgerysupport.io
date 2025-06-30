'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import PasswordResetModal from '@/components/auth/PasswordResetModal';
import { Loader2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if we have the required parameters for password reset
    const token = searchParams.get('token');
    const type = searchParams.get('type');

    if (type === 'recovery' && token) {
      setIsModalOpen(true);
    }
    
    setIsLoading(false);
  }, [searchParams]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-primary/10">
      <PasswordResetModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
      />
      
      {/* Fallback content if modal is not open */}
      {!isModalOpen && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Password Reset
            </h1>
            <p className="text-gray-600 mb-6">
              This page is used for password reset. If you arrived here by mistake, 
              please return to the login page.
            </p>
            <a 
              href="/" 
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Return to Login
            </a>
          </div>
        </div>
      )}
    </div>
  );
}