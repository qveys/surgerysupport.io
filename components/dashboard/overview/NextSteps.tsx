'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react';

interface NextStepItem {
  id: string;
  title: string;
  time: string;
  icon: 'alert' | 'clock' | 'check';
  priority?: 'high' | 'medium' | 'low';
}

interface NextStepsProps {
  steps?: NextStepItem[];
}

export function NextSteps({ steps }: NextStepsProps) {
  const defaultSteps: NextStepItem[] = [
    {
      id: '1',
      title: 'Stop eating 12 hours before surgery',
      time: 'Due in 2 days',
      icon: 'alert',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Arrive 2 hours early on surgery day',
      time: 'Surgery day',
      icon: 'clock'
    },
    {
      id: '3',
      title: 'Complete post-op care reading',
      time: 'Before surgery',
      icon: 'check'
    }
  ];

  const stepsList = steps || defaultSteps;

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'alert':
        return <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />;
      case 'clock':
        return <Clock className="w-5 h-5 text-blue-500 mt-0.5" />;
      case 'check':
        return <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500 mt-0.5" />;
    }
  };

  return (
    <Card className="surgery-card">
      <CardHeader>
        <CardTitle>Next Steps</CardTitle>
        <CardDescription>Upcoming tasks and reminders</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {stepsList.map((step) => (
          <div key={step.id} className="flex items-start space-x-3">
            {getIcon(step.icon)}
            <div className="flex-1">
              <div className="text-sm font-medium">{step.title}</div>
              <div className="text-xs text-gray-500">{step.time}</div>
              {step.priority && (
                <Badge variant="outline" className="mt-1 text-xs">
                  {step.priority === 'high' ? 'High Priority' : 'Normal'}
                </Badge>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}