'use client';

import { Heart } from 'lucide-react';

interface WelcomeSectionProps {
  userName: string;
  surgeryType: string;
  provider: string;
}

export function WelcomeSection({ userName, surgeryType, provider }: WelcomeSectionProps) {
  return (
    <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Welcome back, {userName}!</h2>
          <p className="text-primary-foreground/90">
            Your {surgeryType} is scheduled with {provider}
          </p>
        </div>
        <Heart className="hidden md:block w-8 h-8 text-primary-foreground/80" />
      </div>
    </div>
  );
}