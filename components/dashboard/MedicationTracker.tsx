'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Pill, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Plus,
  Calendar,
  Bell
} from 'lucide-react';

interface MedicationTrackerProps {
  user: any;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  instructions: string;
  startDate: string;
  endDate?: string;
  category: 'pain-management' | 'antibiotic' | 'anti-inflammatory' | 'supplement';
  sideEffects?: string[];
  taken: { [key: string]: boolean };
}

export default function MedicationTracker({ user }: MedicationTrackerProps) {
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: '1',
      name: 'Acetaminophen',
      dosage: '500mg',
      frequency: '3 times daily',
      times: ['08:00', '14:00', '20:00'],
      instructions: 'Take with food to reduce stomach irritation',
      startDate: '2024-01-20',
      endDate: '2024-02-20',
      category: 'pain-management',
      sideEffects: ['Nausea', 'Dizziness'],
      taken: {
        '2024-01-25-08:00': true,
        '2024-01-25-14:00': true,
        '2024-01-25-20:00': false,
        '2024-01-26-08:00': false,
        '2024-01-26-14:00': false,
        '2024-01-26-20:00': false
      }
    },
    {
      id: '2',
      name: 'Cephalexin',
      dosage: '250mg',
      frequency: '4 times daily',
      times: ['06:00', '12:00', '18:00', '24:00'],
      instructions: 'Take exactly as prescribed, complete full course',
      startDate: '2024-01-22',
      endDate: '2024-02-05',
      category: 'antibiotic',
      sideEffects: ['Upset stomach', 'Diarrhea'],
      taken: {
        '2024-01-25-06:00': true,
        '2024-01-25-12:00': true,
        '2024-01-25-18:00': true,
        '2024-01-25-24:00': false,
        '2024-01-26-06:00': false,
        '2024-01-26-12:00': false,
        '2024-01-26-18:00': false,
        '2024-01-26-24:00': false
      }
    },
    {
      id: '3',
      name: 'Ibuprofen',
      dosage: '200mg',
      frequency: '2 times daily',
      times: ['09:00', '21:00'],
      instructions: 'Take with food, do not exceed maximum daily dose',
      startDate: '2024-01-18',
      endDate: '2024-02-15',
      category: 'anti-inflammatory',
      taken: {
        '2024-01-25-09:00': true,
        '2024-01-25-21:00': true,
        '2024-01-26-09:00': false,
        '2024-01-26-21:00': false
      }
    },
    {
      id: '4',
      name: 'Vitamin D3',
      dosage: '1000 IU',
      frequency: 'Once daily',
      times: ['08:00'],
      instructions: 'Take with breakfast for better absorption',
      startDate: '2024-01-15',
      category: 'supplement',
      taken: {
        '2024-01-25-08:00': true,
        '2024-01-26-08:00': false
      }
    }
  ]);

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const toggleMedication = (medicationId: string, date: string, time: string) => {
    const key = `${date}-${time}`;
    setMedications(meds => 
      meds.map(med => 
        med.id === medicationId 
          ? { ...med, taken: { ...med.taken, [key]: !med.taken[key] } }
          : med
      )
    );
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'pain-management': return 'bg-red-100 text-red-800 border-red-200';
      case 'antibiotic': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'anti-inflammatory': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'supplement': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTodaysProgress = () => {
    let totalDoses = 0;
    let takenDoses = 0;

    medications.forEach(med => {
      med.times.forEach(time => {
        const key = `${today}-${time}`;
        totalDoses++;
        if (med.taken[key]) {
          takenDoses++;
        }
      });
    });

    return totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;
  };

  const getUpcomingDoses = () => {
    const upcoming: { medication: Medication; time: string; overdue: boolean }[] = [];
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

    medications.forEach(med => {
      med.times.forEach(time => {
        const todayKey = `${today}-${time}`;
        const tomorrowKey = `${tomorrow}-${time}`;
        
        if (!med.taken[todayKey] && time >= currentTime) {
          upcoming.push({ 
            medication: med, 
            time, 
            overdue: time < currentTime 
          });
        } else if (!med.taken[tomorrowKey] && time < currentTime) {
          upcoming.push({ 
            medication: med, 
            time, 
            overdue: false 
          });
        }
      });
    });

    return upcoming.sort((a, b) => a.time.localeCompare(b.time));
  };

  const upcomingDoses = getUpcomingDoses();
  const todaysProgress = getTodaysProgress();

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Medication Tracker</h2>
          <p className="text-gray-600">Manage your medications and track adherence</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Add Medication
        </Button>
      </div>

      {/* Daily Progress */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="surgery-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{todaysProgress}%</div>
                <div className="text-sm text-gray-600">Today's Progress</div>
              </div>
            </div>
            <Progress value={todaysProgress} className="mt-4" />
          </CardContent>
        </Card>

        <Card className="surgery-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{upcomingDoses.length}</div>
                <div className="text-sm text-gray-600">Upcoming Doses</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="surgery-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Pill className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{medications.length}</div>
                <div className="text-sm text-gray-600">Active Medications</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Doses */}
      {upcomingDoses.length > 0 && (
        <Card className="surgery-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-primary" />
              <span>Upcoming Doses</span>
            </CardTitle>
            <CardDescription>
              Medications scheduled for today and tomorrow
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingDoses.map((dose, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${dose.overdue ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{dose.medication.name}</h3>
                    <p className="text-sm text-gray-600">{dose.medication.dosage}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-medium">{dose.time}</div>
                    {dose.overdue && (
                      <Badge variant="destructive" className="text-xs">
                        Overdue
                      </Badge>
                    )}
                  </div>
                  <Button 
                    size="sm"
                    onClick={() => toggleMedication(dose.medication.id, today, dose.time)}
                  >
                    Mark as Taken
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Medication List */}
      <div className="space-y-4">
        {medications.map((medication) => (
          <Card key={medication.id} className="surgery-card">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Pill className="w-5 h-5 text-primary" />
                    <span>{medication.name}</span>
                  </CardTitle>
                  <CardDescription>
                    {medication.dosage} • {medication.frequency}
                  </CardDescription>
                </div>
                <Badge variant="outline" className={getCategoryColor(medication.category)}>
                  {medication.category.replace('-', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Instructions</h4>
                  <p className="text-sm text-gray-600">{medication.instructions}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Schedule</h4>
                  <div className="flex flex-wrap gap-2">
                    {medication.times.map((time) => (
                      <Badge key={time} variant="outline" className="text-xs">
                        {time}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {medication.sideEffects && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <span>Side Effects to Watch</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {medication.sideEffects.map((effect) => (
                      <Badge key={effect} variant="outline" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200">
                        {effect}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Today's Schedule */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Today's Schedule</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {medication.times.map((time) => {
                    const key = `${today}-${time}`;
                    const isTaken = medication.taken[key];
                    
                    return (
                      <div key={time} className="flex items-center space-x-2 p-2 border border-gray-200 rounded">
                        <Checkbox
                          checked={isTaken}
                          onCheckedChange={() => toggleMedication(medication.id, today, time)}
                        />
                        <span className={`text-sm ${isTaken ? 'text-green-600 line-through' : 'text-gray-900'}`}>
                          {time}
                        </span>
                        {isTaken && <CheckCircle className="w-4 h-4 text-green-600" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="ghost" size="sm">
                  <Bell className="w-4 h-4 mr-2" />
                  Set Reminder
                </Button>
                <Button variant="ghost" size="sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  View History
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}