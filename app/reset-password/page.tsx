'use client';

import { Loader2 } from 'lucide-react';

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-primary/10">
      {/* Fallback content - password reset functionality can be added later */}
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
    </div>
  );
}