'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Shield, Clock, Users, AlertCircle, Zap, User, Stethoscope, UserCheck, Settings } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function AuthPage() {
  const { t, language } = useLanguage();
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState('Patient');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const roleOptions = [
    {
      value: 'Patient',
      label: 'Patient',
      description: 'I am seeking medical care and surgery support',
      icon: <User className="w-5 h-5" />
    },
    {
      value: 'Recovery Coordinator',
      label: 'Recovery Coordinator',
      description: 'I coordinate patient care and recovery plans',
      icon: <UserCheck className="w-5 h-5" />
    },
    {
      value: 'Nurse',
      label: 'Nurse',
      description: 'I provide medical care and patient support',
      icon: <Stethoscope className="w-5 h-5" />
    },
    {
      value: 'Clinic Administrator',
      label: 'Clinic Administrator',
      description: 'I manage clinic operations and staff',
      icon: <Settings className="w-5 h-5" />
    },
    {
      value: 'Sales',
      label: 'Sales Representative',
      description: 'I help patients with consultation and booking',
      icon: <Heart className="w-5 h-5" />
    }
  ];

  const handleSubmit = async (e: React.FormEvent, isSignUp: boolean) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (isSignUp && !name.trim()) {
      setError('Please enter your full name');
      return;
    }
    
    // Check if terms are accepted for sign up
    if (isSignUp && !acceptedTerms) {
      setError(t('auth.mustAcceptTerms'));
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isSignUp) {
        console.log('Starting signup process with:', { email, name, selectedRole });
        await signUp(email, password, name, selectedRole);
        // Don't set loading to false here - let AuthContext handle it
      } else {
        await signIn(email, password);
        // Don't set loading to false here - let AuthContext handle it
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'An error occurred');
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotPasswordError('');
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setForgotPasswordError(error.message);
      } else {
        setForgotPasswordSent(true);
      }
    } catch (err: any) {
      setForgotPasswordError(err.message || 'An error occurred while sending the reset email');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForgotPasswordModal = () => {
    setForgotPasswordEmail('');
    setForgotPasswordSent(false);
    setForgotPasswordError('');
    setForgotPasswordOpen(false);
  };

  const selectedRoleData = roleOptions.find(role => role.value === selectedRole);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-primary/10 flex items-center justify-center p-4 relative" lang={language}>
      {/* Bolt Badge - Top Right */}
      <div className="absolute top-4 right-4 z-50">
        <div className="relative group">
          <div className="w-16 h-16 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center transition-all duration-300 hover:shadow-xl hover:scale-105">
            <div className="relative w-12 h-12">
              <a href="https://bolt.new">
                <Image
                  src="/white_circle_360x360.png"
                  alt="Powered by Bolt"
                  width={48}
                  height={48}
                  className="w-full h-full object-contain"
                />
              </a>
              <div className="absolute inset-0 flex items-center justify-center">
                <Zap className="w-6 h-6 text-black" />
              </div>
            </div>
          </div>
          
          {/* Tooltip */}
          <div className="absolute top-full right-0 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <div className="bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              Powered by Bolt.new
            </div>
            <div className="absolute -top-1 right-4 w-2 h-2 bg-black transform rotate-45"></div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding and Features */}
        <div className="space-y-8 text-center lg:text-left">
          <div className="space-y-4">
            <div className="flex items-center justify-center lg:justify-start space-x-2">
              <Image 
                src="/icon.png" 
                alt="Surgery Support Icon" 
                width={40} 
                height={40}
                className="w-10 h-10"
              />
              <span className="text-2xl font-bold text-gray-900">{t('brand.name')}</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              {language === 'th' ? (
                <>
                  การฟื้นฟูของคุณ
                  <span className="text-primary block">ตามแบบของคุณ</span>
                </>
              ) : (
                <>
                  Your Recovery,
                  <span className="text-primary block">Your Way</span>
                </>
              )}
            </h1>
            <p className="text-xl text-gray-600 max-w-lg mx-auto lg:mx-0">
              {t('brand.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto lg:mx-0">
            <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900">{t('brand.features.securePrivate')}</div>
                <div className="text-sm text-gray-600">{t('brand.features.hipaaCompliant')}</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900">{t('brand.features.support247')}</div>
                <div className="text-sm text-gray-600">{t('brand.features.alwaysAvailable')}</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900">{t('brand.features.expertCareTeam')}</div>
                <div className="text-sm text-gray-600">{t('brand.features.boardCertified')}</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900">{t('brand.features.personalisedCare')}</div>
                <div className="text-sm text-gray-600">{t('brand.features.tailoredPlans')}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center lg:justify-start space-x-6 text-sm text-gray-500">
            <Link href="/privacy" className="flex items-center space-x-2 hover:text-primary transition-colors">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>{t('auth.privacyPolicy')}</span>
            </Link>
            <Link href="/terms" className="flex items-center space-x-2 hover:text-primary transition-colors">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>{t('auth.termsOfService')}</span>
            </Link>
          </div>
        </div>

        {/* Right side - Authentication Form */}
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-md shadow-xl border-0 bg-white">
            <CardHeader className="space-y-1 text-center">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <CardTitle className="text-2xl font-bold">{t('auth.welcome')}</CardTitle>
                </div>
                <LanguageSwitcher />
              </div>
              <CardDescription>
                {t('auth.signInDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              )}

              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">{t('auth.signIn')}</TabsTrigger>
                  <TabsTrigger value="signup">{t('auth.signUp')}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin" className="space-y-4">
                  <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">{t('auth.email')}</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder={t('auth.enterEmail')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">{t('auth.password')}</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder={t('auth.enterPassword')}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="flex items-center justify-end">
                      <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="link" 
                            className="text-sm text-primary hover:text-primary/80 p-0 h-auto"
                            type="button"
                            disabled={isLoading}
                          >
                            {t('auth.forgotPassword')}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>{t('auth.resetPassword')}</DialogTitle>
                            <DialogDescription>
                              {t('auth.resetDescription')}
                            </DialogDescription>
                          </DialogHeader>
                          
                          {forgotPasswordError && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                              <AlertCircle className="w-4 h-4 text-red-600" />
                              <span className="text-sm text-red-700">{forgotPasswordError}</span>
                            </div>
                          )}

                          {!forgotPasswordSent ? (
                            <form onSubmit={handleForgotPassword} className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="forgot-email">{t('auth.email')}</Label>
                                <Input
                                  id="forgot-email"
                                  type="email"
                                  placeholder={t('auth.enterEmail')}
                                  value={forgotPasswordEmail}
                                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                                  required
                                />
                              </div>
                              <div className="flex justify-end space-x-2">
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  onClick={resetForgotPasswordModal}
                                  disabled={isLoading}
                                >
                                  {t('common.cancel')}
                                </Button>
                                <Button 
                                  type="submit" 
                                  disabled={isLoading || !forgotPasswordEmail.trim()}
                                  className="bg-primary hover:bg-primary/90"
                                >
                                  {isLoading ? t('common.loading') : 'Send Reset Link'}
                                </Button>
                              </div>
                            </form>
                          ) : (
                            <div className="space-y-4">
                              <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                                <div className="text-green-800">
                                  <p className="font-medium">{t('auth.resetLinkSent')}</p>
                                  <p className="text-sm mt-1">
                                    Check your email at <strong>{forgotPasswordEmail}</strong> for instructions to reset your password.
                                  </p>
                                </div>
                              </div>
                              <div className="flex justify-end">
                                <Button 
                                  onClick={resetForgotPasswordModal}
                                  className="bg-primary hover:bg-primary/90"
                                >
                                  {t('common.ok')}
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary/90" 
                      disabled={isLoading}
                    >
                      {isLoading ? t('auth.signingIn') : t('auth.signIn')}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup" className="space-y-4">
                  <form onSubmit={(e) => handleSubmit(e, true)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t('auth.fullName')}</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder={t('auth.enterFullName')}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">{t('auth.email')}</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder={t('auth.enterEmail')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">{t('auth.password')}</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder={t('auth.createPassword')}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    
                    {/* Role Selection */}
                    <div className="space-y-3">
                      <Label htmlFor="role-select">I am a...</Label>
                      <Select value={selectedRole} onValueChange={setSelectedRole} disabled={isLoading}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roleOptions.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              <div className="flex items-center space-x-2">
                                {role.icon}
                                <div>
                                  <div className="font-medium">{role.label}</div>
                                  <div className="text-xs text-gray-500">{role.description}</div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {/* Selected Role Preview */}
                      {selectedRoleData && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center space-x-2">
                            {selectedRoleData.icon}
                            <div>
                              <div className="font-medium text-blue-900">{selectedRoleData.label}</div>
                              <div className="text-sm text-blue-700">{selectedRoleData.description}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Terms and Privacy Policy Acceptance */}
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="accept-terms"
                          checked={acceptedTerms}
                          onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                          className="mt-1"
                          disabled={isLoading}
                        />
                        <div className="text-sm text-gray-600 leading-relaxed">
                          <Label htmlFor="accept-terms" className="cursor-pointer">
                            {t('auth.acceptTerms').split('Privacy Policy')[0]}
                            <Link 
                              href="/privacy" 
                              className="text-primary hover:text-primary/80 underline"
                              target="_blank"
                            >
                              {t('auth.privacyPolicy')}
                            </Link>
                            {language === 'th' ? ' และ ' : ' and '}
                            <Link 
                              href="/terms" 
                              className="text-primary hover:text-primary/80 underline"
                              target="_blank"
                            >
                              {t('auth.termsOfService')}
                            </Link>
                          </Label>
                        </div>
                      </div>
                      
                      {!acceptedTerms && (
                        <div className="text-xs text-gray-500 ml-7">
                          {t('auth.mustAcceptTerms')}
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary/90" 
                      disabled={isLoading || !acceptedTerms}
                    >
                      {isLoading ? t('auth.creatingAccount') : t('auth.createAccount')}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}