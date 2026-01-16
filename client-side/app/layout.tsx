import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { DashboardLayout } from '@/src/features/dashboard/components/dashboard-layout';
import { Toaster } from '@/components/ui/sonner';
import { Analytics } from '@vercel/analytics/react';

export const metadata: Metadata = {
  title: 'HRMS Lite - Human Resource Management System',
  description:
    'Professional HR management system for employees and attendance tracking',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        <DashboardLayout>
          {children}
          <Toaster />
          <Analytics />
        </DashboardLayout>
      </body>
    </html>
  );
}
