<p align="center">
  <img src="./public/openboard-mark.svg" alt="Logo OpenBoard" width="72" height="72" />
</p>

<h1 align="center">OpenBoard</h1>

<p align="center">Whiteboard digital untuk membuat sketsa, diagram, dan catatan. Tanpa akun, dengan penyimpanan lokal di browser.</p>

OpenBoard adalah aplikasi whiteboard single-player yang dibuat dengan Next.js. Papan disimpan di browser, jadi tidak ada sinkronisasi cloud antar perangkat.

## Fitur

- Menggambar dengan pen, garis, persegi, dan elips.
- Menambahkan teks dan sticky note, memilih atau menghapus objek, serta menggeser dan memperbesar kanvas.
- Menyimpan papan otomatis ke IndexedDB dengan jurnal pemulihan lokal.
- Mengekspor seluruh papan atau objek terpilih ke PNG, SVG, atau JSON. PNG mencakup objek di luar viewport.
- Mengimpor papan dari file JSON.
- Memilih tema terang atau gelap.

## Teknologi

| Area | Teknologi |
| --- | --- |
| Framework | Next.js 16, React 19 |
| Bahasa | TypeScript |
| UI | Tailwind CSS 4, Lucide |
| State | Redux Toolkit |
| Canvas | HTML Canvas, Rough.js |
| Penyimpanan | Dexie.js, IndexedDB |

## Menjalankan secara lokal

### Prasyarat

- Node.js
- npm

### Instalasi

```bash
git clone https://github.com/grup-belajar/open-board.git
cd open-board
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

### Perintah yang tersedia

```bash
npm run dev    # Jalankan server pengembangan
npm run lint   # Periksa ESLint
npm run build  # Buat build produksi
npm run start  # Jalankan build produksi
```

Jalankan `npm run build` sebelum `npm run start`.

## Penyimpanan papan

Papan dan jurnal pemulihan tersimpan di browser yang sedang digunakan. Data tidak otomatis berpindah ke browser atau perangkat lain. Ekspor papan ke JSON untuk membuat cadangan atau memindahkannya.

## Struktur proyek

```text
src/
├── app/           # Halaman beranda dan workspace board
├── components/    # Kanvas, toolbar, panel, dan modal
├── hooks/         # Drawing, selection, dan keyboard shortcuts
├── lib/           # Database, geometri, dan export engine
└── store/         # Redux store dan slice
```

## Alur branch

- `main`: rilis stabil.
- `dev`: integrasi perubahan yang siap ditinjau.
- `feat/*` dan `fix/*`: branch kerja yang dibuat dari `dev`, lalu digabungkan kembali ke `dev` setelah ditinjau.

## Kontributor

- [kisnak21](https://github.com/kisnak21)
- [novalCandra](https://github.com/novalCandra)
- [farizabdurahman](https://github.com/farizabdurahman)
