import type { Metadata } from 'next';
import localFont from 'next/font/local';
import Script from 'next/script';
import './globals.css';
import ReduxProvider from '../components/providers/ReduxProvider';

const montserrat = localFont({
  src: [
    { path: './fonts/Montserrat-800.ttf', weight: '800', style: 'normal' },
    { path: './fonts/Montserrat-900.ttf', weight: '900', style: 'normal' },
  ],
  variable: '--font-display',
  display: 'swap',
});

const inter = localFont({
  src: [
    { path: './fonts/Inter-400.ttf', weight: '400', style: 'normal' },
    { path: './fonts/Inter-500.ttf', weight: '500', style: 'normal' },
    { path: './fonts/Inter-700.ttf', weight: '700', style: 'normal' },
  ],
  variable: '--font-body',
  display: 'swap',
});

const spaceMono = localFont({
  src: [
    { path: './fonts/SpaceMono-400.ttf', weight: '400', style: 'normal' },
    { path: './fonts/SpaceMono-700.ttf', weight: '700', style: 'normal' },
  ],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'OpenBoard',
  description: 'Whiteboard digital offline-first dengan gaya hand-drawn. Gratis, tanpa login, langsung eksekusi.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      className={`${montserrat.variable} ${inter.variable} ${spaceMono.variable}`}
      suppressHydrationWarning
    >
      <body className="font-body text-on-surface bg-surface antialiased">
        <Script id="openboard-theme" strategy="beforeInteractive">
          {`try {
            const theme = localStorage.getItem('openboard-theme');
            if (theme === 'dark' || theme === 'light') {
              document.documentElement.dataset.theme = theme;
            }
          } catch {}`}
        </Script>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
