'use client';

import PasswordResetModal from '@/components/auth/PasswordResetModal';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || undefined;
  const type = searchParams.get('type') || undefined;

  // Only show modal if type is 'recovery' and token exists
  const isModalOpen = type === 'recovery' && !!token;

  const handleCloseModal = () => {
    // No-op: modal close logic should be handled in the modal or via router
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-primary/10">
      <PasswordResetModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        token={token}
        type={type}
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