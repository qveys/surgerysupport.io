'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { 
  AlertCircle, 
  CheckCircle, 
  Eye, 
  EyeOff, 
  Lock, 
  Loader2,
  Shield,
  X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  token?: string;
  type?: string;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
  met: boolean;
}

export default function PasswordResetModal({ isOpen, onClose, token, type }: PasswordResetModalProps) {
  const { t } = useLanguage();
  const router = useRouter();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);

  // Password requirements
  const [requirements, setRequirements] = useState<PasswordRequirement[]>([
    { label: 'At least 8 characters', test: (pwd) => pwd.length >= 8, met: false },
    { label: 'One uppercase letter', test: (pwd) => /[A-Z]/.test(pwd), met: false },
    { label: 'One lowercase letter', test: (pwd) => /[a-z]/.test(pwd), met: false },
    { label: 'One number', test: (pwd) => /\d/.test(pwd), met: false },
    { label: 'One special character', test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd), met: false }
  ]);

  // Verify token on component mount
  useEffect(() => {
    const verifyToken = async () => {
      const accessToken = token;
      const recoveryType = type;
      const refreshToken = undefined;

      if (recoveryType !== 'recovery' || !accessToken) {
        setError('Invalid or missing reset token. Please request a new password reset.');
        setIsVerifying(false);
        return;
      }

      try {
        setTokenValid(true);
      } catch (err) {
        setError('An error occurred while verifying your reset token.');
      } finally {
        setIsVerifying(false);
      }
    };

    if (isOpen) {
      verifyToken();
    }
  }, [isOpen, token, type]);

  // Update password requirements as user types
  useEffect(() => {
    setRequirements(prev => 
      prev.map(req => ({
        ...req,
        met: req.test(newPassword)
      }))
    );
  }, [newPassword]);

  const getPasswordStrength = () => {
    const metRequirements = requirements.filter(req => req.met).length;
    return (metRequirements / requirements.length) * 100;
  };

  const getPasswordStrengthLabel = () => {
    const strength = getPasswordStrength();
    if (strength < 40) return { label: 'Weak', color: 'text-red-600' };
    if (strength < 80) return { label: 'Fair', color: 'text-yellow-600' };
    return { label: 'Strong', color: 'text-green-600' };
  };

  const isPasswordValid = () => {
    return requirements.every(req => req.met);
  };

  const doPasswordsMatch = () => {
    return newPassword === confirmPassword && confirmPassword.length > 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isPasswordValid()) {
      setError('Please ensure your password meets all requirements.');
      return;
    }

    if (!doPasswordsMatch()) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/');
          onClose();
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating your password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      // Clear URL parameters
      router.replace('/');
    }
  };

  const strengthInfo = getPasswordStrengthLabel();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <DialogTitle>Reset Your Password</DialogTitle>
                <DialogDescription>
                  Create a new secure password for your account
                </DialogDescription>
              </div>
            </div>
            {!isLoading && (
              <Button variant="ghost" size="sm" onClick={handleClose}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        {isVerifying ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-gray-600">Verifying your reset token...</p>
          </div>
        ) : !tokenValid ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-900">Invalid Reset Link</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleClose}>
                Close
              </Button>
            </div>
          </div>
        ) : success ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900">Password Updated Successfully!</p>
                <p className="text-sm text-green-700">
                  You will be redirected to the login page in a few seconds.
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            {/* New Password Field */}
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  className="pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </Button>
              </div>

              {/* Password Strength Indicator */}
              {newPassword && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Password strength:</span>
                    <span className={`text-xs font-medium ${strengthInfo.color}`}>
                      {strengthInfo.label}
                    </span>
                  </div>
                  <Progress value={getPasswordStrength()} className="h-2" />
                </div>
              )}
            </div>

            {/* Password Requirements */}
            {newPassword && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Password Requirements</Label>
                <div className="space-y-1">
                  {requirements.map((req, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      {req.met ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                      )}
                      <span className={`text-sm ${req.met ? 'text-green-700' : 'text-gray-600'}`}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  className="pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </Button>
              </div>

              {/* Password Match Indicator */}
              {confirmPassword && (
                <div className="flex items-center space-x-2">
                  {doPasswordsMatch() ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-700">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span className="text-sm text-red-700">Passwords do not match</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Security Notice */}
            <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Security Notice</p>
                <p>
                  After updating your password, you'll be signed out of all devices and 
                  need to sign in again with your new password.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={isLoading || !isPasswordValid() || !doPasswordsMatch()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating Password...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Update Password
                </>
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}