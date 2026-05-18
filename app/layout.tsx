import type {Metadata} from 'next';
import { Tajawal } from 'next/font/google';
import './globals.css';
import { SettingsProvider } from '@/components/SettingsProvider';

const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-tajawal',
});

export const metadata: Metadata = {
  title: 'My Creative Portfolio',
  description: 'A modern, customizable portfolio to showcase my work.',
};

/**
 * Establishes the outermost server-rendered boundary for document definitions,
 * configuring regional parameters, fundamental font loading, and global CSS resets.
 */
export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ar" dir="rtl" className={`${tajawal.variable} scroll-smooth`} suppressHydrationWarning>
      <body className="font-tajawal bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-zinc-900 antialiased" suppressHydrationWarning>
        <SettingsProvider>
          {children}
        </SettingsProvider>
      </body>
    </html>
  );
}
