import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="flex h-12 items-center justify-between border-b border-gray-200 bg-white px-4">
      <Link href="/" className="text-sm font-semibold">
        OpenBoard
      </Link>
    </header>
  );
}