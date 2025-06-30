'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  FileText, 
  Activity,
  Search,
  Filter,
  Plus,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  User,
  Stethoscope,
  Heart,
  Shield
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { DatabaseService } from '@/lib/supabase/database';

interface CareTeamDashboardProps {
  user: any;
}

interface PatientSummary {
  id: string;
  name: string;
  email: string;
  lastActivity: string;
  upcomingAppointments: number;
  unreadMessages: number;
  completedTasks: number;
  totalTasks: number;
  status: 'active' | 'inactive' | 'critical';
}

interface DashboardStats {
  totalPatients: number;
  activePatients: number;
  upcomingAppointments: number;
  unreadMessages: number;
  completedTasks: number;
  pendingTasks: number;
}

export default function CareTeamDashboard({ user }: CareTeamDashboardProps) {
  const { t, language } = useLanguage();
  const { user: authUser, hasRole, getRoleName } = useAuth();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('overview');
  
  // Mock data - in production, this would come from your database
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    activePatients: 0,
    upcomingAppointments: 0,
    unreadMessages: 0,
    completedTasks: 0,
    pendingTasks: 0
  });

  const [patients, setPatients] = useState<PatientSummary[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, [authUser?.id]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Simulate API calls with realistic data
      await new Promise(resolve => setTimeout(resolve, 500)); // Reduced from potential longer load time
      
      // Mock stats based on role
      const mockStats: DashboardStats = {
        totalPatients: hasRole('Clinic Administrator') ? 156 : hasRole('Recovery Coordinator') ? 45 : 23,
        activePatients: hasRole('Clinic Administrator') ? 134 : hasRole('Recovery Coordinator') ? 38 : 19,
        upcomingAppointments: hasRole('Clinic Administrator') ? 89 : hasRole('Recovery Coordinator') ? 28 : 12,
        unreadMessages: hasRole('Clinic Administrator') ? 23 : hasRole('Recovery Coordinator') ? 8 : 4,
        completedTasks: hasRole('Clinic Administrator') ? 1247 : hasRole('Recovery Coordinator') ? 342 : 156,
        pendingTasks: hasRole('Clinic Administrator') ? 78 : hasRole('Recovery Coordinator') ? 24 : 11
      };

      // Mock patient data
      const mockPatients: PatientSummary[] = [
        {
          id: '1',
          name: 'Sarah Johnson',
          email: 'sarah.j@email.com',
          lastActivity: '2 hours ago',
          upcomingAppointments: 2,
          unreadMessages: 1,
          completedTasks: 8,
          totalTasks: 12,
          status: 'active'
        },
        {
          id: '2',
          name: 'Michael Chen',
          email: 'michael.c@email.com',
          lastActivity: '1 day ago',
          upcomingAppointments: 1,
          unreadMessages: 0,
          completedTasks: 15,
          totalTasks: 16,
          status: 'active'
        },
        {
          id: '3',
          name: 'Emma Wilson',
          email: 'emma.w@email.com',
          lastActivity: '3 hours ago',
          upcomingAppointments: 3,
          unreadMessages: 2,
          completedTasks: 4,
          totalTasks: 14,
          status: 'critical'
        },
        {
          id: '4',
          name: 'David Rodriguez',
          email: 'david.r@email.com',
          lastActivity: '5 days ago',
          upcomingAppointments: 0,
          unreadMessages: 0,
          completedTasks: 12,
          totalTasks: 12,
          status: 'inactive'
        },
        {
          id: '5',
          name: 'Lisa Thompson',
          email: 'lisa.t@email.com',
          lastActivity: '1 hour ago',
          upcomingAppointments: 1,
          unreadMessages: 3,
          completedTasks: 6,
          totalTasks: 10,
          status: 'active'
        }
      ];

      setStats(mockStats);
      setPatients(mockPatients);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'critical': return <AlertCircle className="w-4 h-4" />;
      case 'inactive': return <Clock className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case 'Recovery Coordinator': return <Heart className="w-5 h-5 text-primary" />;
      case 'Nurse': return <Stethoscope className="w-5 h-5 text-blue-600" />;
      case 'Clinic Administrator': return <Shield className="w-5 h-5 text-purple-600" />;
      case 'Sales': return <TrendingUp className="w-5 h-5 text-green-600" />;
      default: return <User className="w-5 h-5 text-gray-600" />;
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayName = user.profile?.full_name || user.email;
  const roleName = getRoleName();

  if (loading) {
    return (
      <div className="space-y-6 fade-in">
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-6 text-white">
          <div className="animate-pulse">
            <div className="h-8 bg-white/20 rounded w-64 mb-2"></div>
            <div className="h-4 bg-white/20 rounded w-48"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="surgery-card">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in" lang={language}>
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              {getRoleIcon(roleName)}
              <h2 className="text-2xl font-bold">Welcome, {displayName}!</h2>
            </div>
            <p className="text-primary-foreground/90">
              {roleName} Dashboard - Managing patient care and coordination
            </p>
          </div>
          <div className="hidden md:block">
            <div className="text-right">
              <div className="text-sm opacity-90">Today</div>
              <div className="text-lg font-semibold">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="surgery-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalPatients}</div>
                <div className="text-sm text-gray-600">Total Patients</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="surgery-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.activePatients}</div>
                <div className="text-sm text-gray-600">Active Patients</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="surgery-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.upcomingAppointments}</div>
                <div className="text-sm text-gray-600">Upcoming Appointments</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="surgery-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.unreadMessages}</div>
                <div className="text-sm text-gray-600">Unread Messages</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card className="surgery-card">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest patient interactions and updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {patients.slice(0, 3).map((patient) => (
                  <div key={patient.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{patient.name}</div>
                      <div className="text-sm text-gray-600">Last active: {patient.lastActivity}</div>
                    </div>
                    <Badge variant="outline" className={getStatusColor(patient.status)}>
                      {patient.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="surgery-card">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Frequently used features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule New Appointment
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Message to Patient
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Create Care Plan
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Activity className="w-4 h-4 mr-2" />
                  View Patient Progress
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Task Summary */}
          <Card className="surgery-card">
            <CardHeader>
              <CardTitle>Task Summary</CardTitle>
              <CardDescription>Overview of patient tasks and completion rates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Completed Tasks</span>
                    <span className="text-2xl font-bold text-green-600">{stats.completedTasks}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Pending Tasks</span>
                    <span className="text-2xl font-bold text-orange-600">{stats.pendingTasks}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="text-sm font-medium">Overall Completion Rate</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.round((stats.completedTasks / (stats.completedTasks + stats.pendingTasks)) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.round((stats.completedTasks / (stats.completedTasks + stats.pendingTasks)) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patients" className="space-y-6">
          {/* Search and Filter */}
          <Card className="surgery-card">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Patient List */}
          <Card className="surgery-card">
            <CardHeader>
              <CardTitle>Patient List</CardTitle>
              <CardDescription>
                {filteredPatients.length} patients found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredPatients.map((patient) => (
                  <div key={patient.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                          <p className="text-sm text-gray-600">{patient.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={getStatusColor(patient.status)}>
                          {getStatusIcon(patient.status)}
                          <span className="ml-1">{patient.status}</span>
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Last Activity</div>
                        <div className="font-medium">{patient.lastActivity}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Appointments</div>
                        <div className="font-medium">{patient.upcomingAppointments}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Messages</div>
                        <div className="font-medium">{patient.unreadMessages}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Tasks</div>
                        <div className="font-medium">{patient.completedTasks}/{patient.totalTasks}</div>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex justify-end space-x-2">
                      <Button size="sm" variant="outline">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Message
                      </Button>
                      <Button size="sm" variant="outline">
                        <Calendar className="w-4 h-4 mr-1" />
                        Schedule
                      </Button>
                      <Button size="sm" variant="outline">
                        <FileText className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <Card className="surgery-card">
            <CardHeader>
              <CardTitle>Task Management</CardTitle>
              <CardDescription>
                Manage patient tasks and care plans
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Task management features coming soon</p>
                <p className="text-sm">Create and assign tasks to patients, track progress, and manage care plans.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card className="surgery-card">
            <CardHeader>
              <CardTitle>Reports & Analytics</CardTitle>
              <CardDescription>
                Patient outcomes and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8 text-gray-500">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Reporting features coming soon</p>
                <p className="text-sm">View patient outcomes, completion rates, and performance analytics.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}