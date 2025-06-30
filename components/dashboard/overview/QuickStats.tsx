'use client';

import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Activity, Shield } from 'lucide-react';

interface QuickStatsProps {
  completedTasks: number;
  upcomingAppointments: number;
  newMessages: number;
}

export function QuickStats({ completedTasks, upcomingAppointments, newMessages }: QuickStatsProps) {
  const stats = [
    {
      icon: CheckCircle,
      value: completedTasks,
      label: 'Tasks Completed',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      icon: Activity,
      value: upcomingAppointments,
      label: 'Upcoming Appointments',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      icon: Shield,
      value: newMessages,
      label: 'New Messages',
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="surgery-card">
            <CardContent className="flex items-center p-6">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-full flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}