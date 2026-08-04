# OpenBoard

Whiteboard digital single-player, offline-first dengan gaya hand-drawn (sketchy).

## Spesifikasi Teknologi
- **Framework:** Next.js (App Router)
- **State Management:** Redux Toolkit
- **Canvas Engine:** HTML5 Canvas + Rough.js
- **Penyimpanan:** Dexie.js (IndexedDB)
- **Styling:** Tailwind CSS

## Alur Kerja Git Branching
1. `main`: Produksi & rilis stabil.
2. `dev`: Branch integrasi pengembangan.
3. `feat/...`: Branch fitur mandiri yang ditarik dari `dev` dan di-merge kembali ke `dev`.
