'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Heart, Shield } from 'lucide-react';
import { formatDate } from '@/lib/utils/common';

interface SurgeryDetailsProps {
  surgeryDate: Date | string;
  surgeryType: string;
  provider: string;
}

export function SurgeryDetails({ surgeryDate, surgeryType, provider }: SurgeryDetailsProps) {
  return (
    <Card className="surgery-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-primary" />
          <span>Surgery Details</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Date</span>
            </div>
            <div className="text-blue-800 font-semibold">
              {formatDate(surgeryDate)}
            </div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Heart className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">Procedure</span>
            </div>
            <div className="text-green-800 font-semibold">{surgeryType}</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Shield className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Provider</span>
            </div>
            <div className="text-purple-800 font-semibold">{provider}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}