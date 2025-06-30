'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Calendar, MessageSquare, Heart } from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  icon: 'checklist' | 'calendar' | 'messages' | 'recovery';
  onClick?: () => void;
}

interface QuickActionsProps {
  actions?: QuickAction[];
  onActionClick?: (actionId: string) => void;
}

export function QuickActions({ actions, onActionClick }: QuickActionsProps) {
  const defaultActions: QuickAction[] = [
    {
      id: 'checklist',
      title: 'View Checklist',
      icon: 'checklist'
    },
    {
      id: 'calendar',
      title: 'Schedule Appointment',
      icon: 'calendar'
    },
    {
      id: 'messages',
      title: 'Message Provider',
      icon: 'messages'
    },
    {
      id: 'medications',
      title: 'Track Medications',
      icon: 'recovery'
    }
  ];

  const actionsList = actions || defaultActions;

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'checklist':
        return <CheckCircle className="w-6 h-6 text-primary group-hover:text-white transition-colors" />;
      case 'calendar':
        return <Calendar className="w-6 h-6 text-primary group-hover:text-white transition-colors" />;
      case 'messages':
        return <MessageSquare className="w-6 h-6 text-primary group-hover:text-white transition-colors" />;
      case 'recovery':
        return <Heart className="w-6 h-6 text-primary group-hover:text-white transition-colors" />;
      default:
        return <CheckCircle className="w-6 h-6 text-primary group-hover:text-white transition-colors" />;
    }
  };

  const handleActionClick = (action: QuickAction) => {
    if (action.onClick) {
      action.onClick();
    } else if (onActionClick) {
      onActionClick(action.id);
    }
  };

  return (
    <Card className="surgery-card">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Frequently used features</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {actionsList.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              className="group h-auto p-4 flex flex-col items-center space-y-2 hover:bg-primary hover:border-primary transition-all duration-200"
              onClick={() => handleActionClick(action)}
            >
              {getIcon(action.icon)}
              <span className="text-sm group-hover:text-white transition-colors">{action.title}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}