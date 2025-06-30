'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  surgeryDate: Date | string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function CountdownTimer({ surgeryDate }: CountdownTimerProps) {
  const [timeUntilSurgery, setTimeUntilSurgery] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeUntilSurgery = () => {
      const now = new Date();
      const targetDate = typeof surgeryDate === 'string' ? new Date(surgeryDate) : surgeryDate;
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeUntilSurgery({ days, hours, minutes, seconds });
      } else {
        setTimeUntilSurgery({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeUntilSurgery();
    const interval = setInterval(calculateTimeUntilSurgery, 1000);

    return () => clearInterval(interval);
  }, [surgeryDate]);

  return (
    <Card className="lg:col-span-2 surgery-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-primary" />
          <span>Surgery Countdown</span>
        </CardTitle>
        <CardDescription>Days remaining until your procedure</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <div className="countdown-number">{timeUntilSurgery.days}</div>
          <div className="text-sm text-gray-600">Days</div>
        </div>
      </CardContent>
    </Card>
  );
}