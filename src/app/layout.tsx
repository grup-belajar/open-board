import type { Metadata } from 'next';
import { Montserrat, Inter, Space_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import ReduxProvider from '../components/providers/ReduxProvider';

const montserrat = Montserrat({
  weight: ['800', '900'],
  subsets: ['latin'],
  variable: '--font-display',
});

const inter = Inter({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-body',
});

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-mono',
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
