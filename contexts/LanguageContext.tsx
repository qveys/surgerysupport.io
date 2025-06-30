'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, defaultLanguage, getTranslation } from '@/lib/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(defaultLanguage);

  // Load saved language preference on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'th')) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language preference when it changes
  useEffect(() => {
    localStorage.setItem('preferred-language', language);
    
    // Update document language and direction
    document.documentElement.lang = language;
    if (language === 'th') {
      document.documentElement.dir = 'ltr'; // Thai is left-to-right
      document.body.style.fontFamily = '"Sarabun", "Noto Sans Thai", sans-serif';
    } else {
      document.documentElement.dir = 'ltr';
      document.body.style.fontFamily = '';
    }
  }, [language]);

  const t = (key: string, params?: Record<string, string>) => {
    return getTranslation(key, language, params);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}