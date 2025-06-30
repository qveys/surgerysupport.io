import './globals.css';
import type { Metadata } from 'next';
import { Inter, Sarabun } from 'next/font/google';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'sonner';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true
});

const sarabun = Sarabun({ 
  subsets: ['latin', 'thai'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sarabun',
  display: 'swap',
  preload: true
});

export const metadata: Metadata = {
  title: 'Surgery Support - Your Complete Recovery Platform',
  description: 'Comprehensive surgery preparation and recovery support with personalised care plans, progress tracking, and secure multilingual communication with healthcare providers.',
  keywords: 'surgery support, recovery platform, medical care, healthcare, surgery preparation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} ${sarabun.variable} font-sans`}>
        <AuthProvider>
          <LanguageProvider>
            <div id="app" className="min-h-screen bg-gray-50">
              {children}
            </div>
            <Toaster 
              position="top-right"
              expand={true}
              richColors={true}
              closeButton={true}
              toastOptions={{
                style: {
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  color: '#374151',
                },
                className: 'toast',
                duration: 5000,
              }}
            />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}