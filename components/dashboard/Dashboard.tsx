'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Sidebar from './Sidebar';
import Overview from './Overview';
import Checklist from './Checklist';
import Calendar from './Calendar';
import SimpleMessages from './SimpleMessages';
import Documents from './Documents';
import MedicationTracker from './MedicationTracker';
import CareTeamDashboard from './CareTeamDashboard';
import { Bell, LogOut, Menu, Users, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth, type AuthUser } from '@/contexts/AuthContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Image from 'next/image';

interface DashboardProps {
  user: AuthUser;
}

export default function Dashboard({ user }: DashboardProps) {
  const { t, language } = useLanguage();
  const { signOut, hasRole, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshUser();
    } catch (error) {
      console.error('Error refreshing user:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Determine if the user is a patient or a care team member
  const isPatient = hasRole('Patient');
  const isCareTeam = hasRole('Recovery Coordinator', 'Nurse', 'Clinic Administrator', 'Sales');

  console.log('Dashboard rendering for user:', user);
  console.log('User role:', user.role?.name);
  console.log('Is patient:', isPatient);
  console.log('Is care team:', isCareTeam);

  // If no role is determined, default to patient view
  const shouldShowPatientDashboard = isPatient || (!isPatient && !isCareTeam);
  const shouldShowCareTeamDashboard = isCareTeam && !isPatient;

  console.log('Should show patient dashboard:', shouldShowPatientDashboard);
  console.log('Should show care team dashboard:', shouldShowCareTeamDashboard);

  const renderContent = () => {
    if (shouldShowCareTeamDashboard) {
      console.log('Rendering care team dashboard');
      return <CareTeamDashboard user={user} />;
    } else {
      console.log('Rendering patient dashboard, active tab:', activeTab);
      // Render patient dashboard content
      switch (activeTab) {
        case 'overview':
          return <Overview user={user} onNavigate={handleNavigate} />;
        case 'checklist':
          return <Checklist user={user} />;
        case 'calendar':
          return <Calendar user={user} />;
        case 'messages':
          return <SimpleMessages user={user} />;
        case 'documents':
          return <Documents user={user} />;
        case 'medications':
          return <MedicationTracker user={user} />;
        default:
          return <Overview user={user} onNavigate={handleNavigate} />;
      }
    }
  };

  // Extract first name from full name or use email as fallback
  const getFirstName = () => {
    const fullName = user.profile?.full_name;
    if (fullName) {
      const firstName = fullName.split(' ')[0];
      return firstName;
    }
    return user.email;
  };

  const displayName = getFirstName();
  const fullDisplayName = user.profile?.full_name || user.email;
  
  const initials = fullDisplayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex h-screen bg-gray-50" lang={language}>
      {/* Mobile sidebar overlay */}
      {shouldShowPatientDashboard && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - only show for patient dashboard */}
      {shouldShowPatientDashboard && (
        <div className={`
          fixed lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out z-50
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={handleNavigate}
            closeSidebar={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {shouldShowPatientDashboard && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 flex items-center justify-center">
                  <Image 
                    src="/icon.png" 
                    alt="surgerysupport.io Icon" 
                    width={32} 
                    height={32}
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {shouldShowCareTeamDashboard ? 'Care Team Dashboard' : 'Patient Dashboard'}
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <LanguageSwitcher />
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRefresh}
                disabled={refreshing}
                className="relative"
              >
                <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
              
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  2
                </span>
              </Button>
              
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{fullDisplayName}</p>
                  <p className="text-xs text-gray-600">{user.email}</p>
                  <p className="text-xs text-gray-500">Role: {user.role?.name || 'Unknown'}</p>
                </div>
              </div>

              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}