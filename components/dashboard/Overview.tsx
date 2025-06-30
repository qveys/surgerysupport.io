'use client';

import { WelcomeSection } from '@/components/dashboard/overview/WelcomeSection';
import { CountdownTimer } from '@/components/dashboard/overview/CountdownTimer';
import { SurgeryDetails } from '@/components/dashboard/overview/SurgeryDetails';
import { ProgressCard } from '@/components/dashboard/overview/ProgressCard';
import { QuickStats } from '@/components/dashboard/overview/QuickStats';
import { RecentActivity } from '@/components/dashboard/overview/RecentActivity';
import { NextSteps } from '@/components/dashboard/overview/NextSteps';
import { QuickActions } from '@/components/dashboard/overview/QuickActions';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface OverviewProps {
  user: any;
  onNavigate?: (tab: string) => void;
}

export default function Overview({ user, onNavigate }: OverviewProps) {
  // Provide default values for missing properties with proper null checks
  const userName = user?.profile?.full_name || user?.email || 'User';
  const surgeryType = user?.surgeryType || 'Cardiac Surgery';
  const provider = user?.provider || 'Dr. Smith';

  // Create a default surgery date (30 days from now) if not provided
  const defaultSurgeryDate = new Date();
  defaultSurgeryDate.setDate(defaultSurgeryDate.getDate() + 16);
  const surgeryDate = user?.surgeryDate || defaultSurgeryDate;

  const preparationProgress = 75;
  const completedTasks = 12;
  const totalTasks = 16;
  const upcomingAppointments = 3;
  const newMessages = 2;

  const handleQuickActionClick = (actionId: string) => {
    if (onNavigate) {
      switch (actionId) {
        case 'checklist':
          onNavigate('checklist');
          break;
        case 'calendar':
          onNavigate('calendar');
          break;
        case 'messages':
          onNavigate('messages');
          break;
        case 'medications':
          onNavigate('medications');
          break;
        default:
          break;
      }
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <WelcomeSection 
        userName={userName}
        surgeryType={surgeryType}
        provider={provider}
      />
      
      {/* Full Width Progress Bar */}
      <Card className="surgery-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span>Preparation Progress</span>
          </CardTitle>
          <CardDescription>
            Your overall surgery preparation completion
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold text-primary">{preparationProgress}%</div>
            <div className="text-sm text-gray-600">
              {completedTasks} of {totalTasks} tasks completed
            </div>
          </div>
          <Progress value={preparationProgress} className="w-full h-3" />
        </CardContent>
      </Card>

      {/* Recent Activity and Next Steps - Moved under Preparation Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <NextSteps />
      </div>
      
      {/* Quick Stats */}
      <QuickStats 
        completedTasks={completedTasks}
        upcomingAppointments={upcomingAppointments}
        newMessages={newMessages}
      />

      {/* Surgery Countdown and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SurgeryDetails 
          surgeryDate={surgeryDate}
          surgeryType={surgeryType}
          provider={provider}
        />
        
        <CountdownTimer surgeryDate={surgeryDate} />
      </div>

      {/* Quick Actions */}
      <QuickActions onActionClick={handleQuickActionClick} />
    </div>
  );
}