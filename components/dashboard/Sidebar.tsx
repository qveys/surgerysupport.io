'use client';

import { Button } from '@/components/ui/button';
import { 
  Heart, 
  CheckSquare, 
  Calendar, 
  MessageSquare, 
  FileText, 
  Pill,
  X
} from 'lucide-react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  closeSidebar: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, closeSidebar }: SidebarProps) {
  const { t } = useLanguage();

  const menuItems = [
    { id: 'overview', label: t('nav.overview'), icon: Heart },
    { id: 'checklist', label: t('nav.checklist'), icon: CheckSquare },
    { id: 'calendar', label: t('nav.calendar'), icon: Calendar },
    { id: 'messages', label: t('nav.messages'), icon: MessageSquare },
    { id: 'documents', label: t('nav.documents'), icon: FileText },
    { id: 'medications', label: t('nav.medications'), icon: Pill },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      {/* Logo and close button */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 flex items-center justify-center">
            <Image 
              src="/icon.png" 
              alt="Surgery Support Icon" 
              width={32} 
              height={32}
              className="w-8 h-8 object-contain"
            />
          </div>
          <span className="text-lg font-bold text-gray-900">surgerysupport.io</span>
        </div>
        <Button variant="ghost" size="sm" className="lg:hidden" onClick={closeSidebar}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                closeSidebar();
              }}
              className={`
                w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors duration-200
                ${isActive 
                  ? 'bg-primary/10 text-primary font-medium border border-primary/20' 
                  : 'text-gray-700 hover:text-primary hover:bg-primary/5'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
              {item.id === 'messages' && (
                <span className="ml-auto w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  2
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}