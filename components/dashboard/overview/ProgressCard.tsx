'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp } from 'lucide-react';

interface ProgressCardProps {
  preparationProgress: number;
  completedTasks: number;
  totalTasks: number;
}

export function ProgressCard({ preparationProgress, completedTasks, totalTasks }: ProgressCardProps) {
  return (
    <Card className="surgery-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <span>Progress</span>
        </CardTitle>
        <CardDescription>Preparation completion</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">{preparationProgress}%</div>
          <div className="text-sm text-gray-600">Complete</div>
        </div>
        <Progress value={preparationProgress} className="w-full" />
        <div className="text-sm text-gray-600 text-center">
          {completedTasks} of {totalTasks} tasks completed
        </div>
      </CardContent>
    </Card>
  );
}