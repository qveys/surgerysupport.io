'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ActivityItem {
  id: string;
  title: string;
  time: string;
  color: string;
}

interface RecentActivityProps {
  activities?: ActivityItem[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const defaultActivities: ActivityItem[] = [
    {
      id: '1',
      title: 'Pre-surgery bloodwork completed',
      time: '2 hours ago',
      color: 'bg-green-500'
    },
    {
      id: '2',
      title: 'Medication schedule updated',
      time: '1 day ago',
      color: 'bg-blue-500'
    },
    {
      id: '3',
      title: 'Pre-op consultation scheduled',
      time: '2 days ago',
      color: 'bg-purple-500'
    }
  ];

  const activityList = activities || defaultActivities;

  return (
    <Card className="surgery-card">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your latest progress updates</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activityList.map((activity) => (
          <div key={activity.id} className="flex items-center space-x-3">
            <div className={`w-3 h-3 ${activity.color} rounded-full`}></div>
            <div className="flex-1">
              <div className="text-sm font-medium">{activity.title}</div>
              <div className="text-xs text-gray-500">{activity.time}</div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}