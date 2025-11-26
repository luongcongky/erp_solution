import './globals.css';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { AuthProvider } from '@/components/AuthProvider';
import { TranslationProvider } from '@/contexts/TranslationContext';
import { Inter } from 'next/font/google';

// Configure Inter font
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: 'ERP System | Enterprise Resource Planning',
  description: 'Comprehensive ERP solution for modern businesses',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body suppressHydrationWarning className={inter.className}>
        <AuthProvider>
          <TranslationProvider>
            <Header />
            <Sidebar />

            <main style={{
              marginLeft: 'var(--sidebar-width)',
              marginTop: 'var(--header-height)',
              padding: 'var(--spacing-xl)',
              minHeight: 'calc(100vh - var(--header-height))',
              background: 'var(--background)',
            }}>
              {children}
            </main>
          </TranslationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
