'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Heart, Loader2, Zap } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface SplashScreenProps {
  onComplete?: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const { t, language } = useLanguage();
  const [progress, setProgress] = useState(0);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Show content after a brief delay
    const contentTimer = setTimeout(() => {
      setShowContent(true);
    }, 300);

    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          // Call onComplete after progress reaches 100%
          setTimeout(() => {
            onComplete?.();
          }, 500);
          return 100;
        }
        return prev + Math.random() * 15 + 5; // Random increment between 5-20
      });
    }, 150);

    return () => {
      clearTimeout(contentTimer);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-white to-primary/10 z-50 relative" lang={language}>
      {/* Language Switcher */}
      <div className="absolute top-6 right-20 z-10">
        <LanguageSwitcher showText />
      </div>

      {/* Bolt Badge - Top Right */}
      <div className="absolute top-4 right-4 z-10">
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

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary rounded-full blur-3xl"></div>
      </div>

      {/* Main Content Container - Centered */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className={`
          flex flex-col items-center space-y-8 transition-all duration-1000 ease-out max-w-2xl w-full
          ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        `}>
          {/* Logo Container */}
          <div className="relative">
            {/* Animated Ring */}
            <div className="absolute inset-0 w-32 h-32 border-4 border-primary/20 rounded-full animate-spin" 
                 style={{ animationDuration: '3s' }}></div>
            <div className="absolute inset-2 w-28 h-28 border-2 border-primary/30 rounded-full animate-spin" 
                 style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
            
            {/* Logo */}
            <div className="relative w-32 h-32 bg-white rounded-full shadow-2xl flex items-center justify-center border-4 border-white">
              <div className="relative w-20 h-20">
                <Image 
                  src="/icon.png" 
                  alt="surgerysupport.io" 
                  width={80} 
                  height={80}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
            </div>

            {/* Pulse Effect */}
            <div className="absolute inset-0 w-32 h-32 bg-primary/10 rounded-full animate-ping"></div>
          </div>

          {/* Brand Name */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
              {t('brand.name')}
            </h1>
            <p className="text-lg text-gray-600 font-medium">
              {t('splash.tagline')}
            </p>
          </div>

          {/* Tagline */}
          <div className="text-center max-w-md">
            <p className="text-gray-500 text-sm leading-relaxed">
              {t('splash.description')}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="w-64 space-y-3">
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
            
            {/* Loading Text */}
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t('splash.preparing')}</span>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-3 gap-6 mt-8">
            <div className="text-center space-y-2">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <p className="text-xs text-gray-600 font-medium">{t('splash.personalisedCare')}</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <p className="text-xs text-gray-600 font-medium">{t('splash.securePrivate')}</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <div className="w-5 h-5 border-2 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <p className="text-xs text-gray-600 font-medium">{t('splash.support247')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Branding */}
      <div className={`
        absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center transition-all duration-1000 delay-500
        ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}>
        <p className="text-xs text-gray-400">
          {t('splash.poweredBy')}
        </p>
      </div>
    </div>
  );
}