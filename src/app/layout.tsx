import type { Metadata } from 'next';
import { Montserrat, Inter, Space_Mono } from 'next/font/google';
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
    <html lang="id" className={`${montserrat.variable} ${inter.variable} ${spaceMono.variable}`}>
      <body className="font-body text-on-surface bg-surface antialiased">
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}