import Link from 'next/link';

const FooterBoardPage = () => (
  <footer className="flex min-h-24 flex-wrap items-center justify-between gap-4 bg-primary px-6 py-5 text-on-primary md:px-20">
    <p className="font-display text-sm md:text-xl">&copy; 2026 OPENBOARD</p>
    <nav aria-label="Tautan footer" className="flex flex-wrap gap-5 font-mono text-xs md:gap-8 md:text-sm">
      <Link
        href="/"
        className="text-on-primary/80 transition-colors hover:text-accent-blue focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-accent-blue"
      >
        Home
      </Link>
      <Link
        href="/#recent-boards"
        className="text-on-primary/80 transition-colors hover:text-accent-blue focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-accent-blue"
      >
        Papan terakhir
      </Link>
      <a
        href="https://github.com/grup-belajar/open-board"
        target="_blank"
        rel="noopener noreferrer"
        className="text-on-primary/80 transition-colors hover:text-accent-blue focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-accent-blue"
      >
        GitHub
      </a>
    </nav>
  </footer>
);

export default FooterBoardPage;
