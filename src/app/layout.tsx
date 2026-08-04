import type { Metadata } from 'next';
import './globals.css';
import ReduxProvider from '../components/providers/ReduxProvider';

export const metadata: Metadata = {
  title: 'OpenBoard',
  description: 'Whiteboard kolaboratif offline-first dengan gaya hand-drawn.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
