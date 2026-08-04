import Link from 'next/link';
import Navbar from '../components/ui/Navbar';

export default async function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
        <h1 className="text-3xl font-bold text-gray-900">OpenBoard</h1>
        <p className="text-gray-500">Whiteboard digital offline-first dengan gaya hand-drawn.</p>
        <Link
          href="/board/default-board"
          className="rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-700"
        >
          Buka Board
        </Link>
      </main>
    </div>
  );
}
