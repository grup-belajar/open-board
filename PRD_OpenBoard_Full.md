# Product Requirement Document (PRD) — OpenBoard

> **Catatan Pengembang & AI Agent:** Dokumen ini dikhususkan sebagai panduan utama pengembang (Engineering) dan **AI Agent (Cursor / Windsurf / Gemini / ChatGPT)** untuk menggenerasi kode yang presisi, terstruktur, dan sesuai batasan modul tim.

---

## 1. Ringkasan Eksekutif & Visi Proyek

### 1.1 Tinjauan Dokumen
* **Nama Proyek:** OpenBoard (Working Title)
* **Versi Dokumen:** v1.2.0 (Stack: Redux Toolkit + Custom Tailwind CSS)
* **Tanggal Update:** 30 Juli 2026
* **Status Proyek:** Fase 1 (MVP Single-Player Whiteboard)
* **Target Waktu Eksekusi:** 3 Minggu (3 Sprint Agile)
* **Pola Kerja Tim:** 3 Orang (1 Team Lead Core Engine, 1 Frontend UI/Tools, 1 Storage/Export)

### 1.2 Pernyataan Visi
OpenBoard bertujuan untuk menyediakan platform *virtual whiteboard* kolaboratif open-source yang cepat, tanpa batasan, dan dirancang khusus untuk pengembang perangkat lunak, desainer, pendidik, serta tim kerja jarak jauh. Dengan menghapus batasan fitur berbayar (*paywall*) pada fungsi-fungsi krusial—seperti kanvas tanpa batas, kebebasan impor/ekspor file, dan alat menggambar yang lengkap—OpenBoard memberi kebebasan penuh bagi pengguna untuk memvisualisasikan ide.

### 1.3 Permasalahan (Problem Statement)
Platform papan tulis digital populer saat ini (seperti Excalidraw, Miro, Mural) menerapkan batasan versi gratis (*freemium*) yang kaku:
* **Keterikatan Format & Penyimpanan:** Batasan jumlah papan yang disimpan di cloud atau penurunan kualitas ekspor (watermark, resolusi rendah) kecuali berlangganan.
* **Fitur Utama Terkunci:** Alat menggambar tingkat lanjut, pustaka bentuk khusus, *laser pointer*, dan optimasi performa kanvas hanya tersedia untuk pengguna berbayar.
* **Privasi & Kepemilikan Data:** Pengguna tidak memiliki kontrol penuh atas lokasi penyimpanan data mereka.

### 1.4 Nilai Unggul Utama (Core Value Propositions)
1. **Penyimpanan Lokal Pertama (Local-First):** Pengeditan tersimpan otomatis secara *offline* melalui IndexedDB di browser, dengan opsi ekspor penuh tanpa watermark.
2. **Kanvas Tanpa Batas & Berperforma Tinggi:** Pergerakan kanvas (*pan* dan *zoom*) yang mulus hingga 60 FPS menggunakan HTML5 Canvas / Rough.js.
3. **Alat Menggambar Lengkap dengan Dua Gaya Visual:** Kemudahan berganti gaya dari corak geometris bersih (*clean vector*) ke gaya coretan tangan organik (*hand-drawn/sketchy*).

---

## 2. Struktur Tim & Pembagian Modul Kode (Team Division)

Proyek ini dikerjakan oleh **3 orang pengembang**. Setiap pengembang memiliki batas tanggung jawab (*code ownership*) yang jelas untuk menghindari konflik repositori Git:

### 👤 Orang 1: Team Lead & Canvas Core Engine (**PERAN ANDA / USER**)
* **Fokus Utama:** Fondasi aplikasi, arsitektur Redux Store, transformasi matematika kanvas, dan mesin render `Rough.js`.
* **Area Kepemilikan Kode (*Code Ownership*):**
  * `app/board/[id]/page.tsx` (Core Workspace Page Setup)
  * `store/index.ts` & `store/slices/canvasSlice.ts` (Core State Objek Kanvas)
  * `components/canvas/WhiteboardCanvas.tsx` (Komponen Utama Canvas API)
  * `lib/roughEngine.ts` (Integrasi Rendering Rough.js)
  * `lib/matrixMath.ts` (Kalkulasi Koordinat Mouse, Pan, & Zoom Matrix)
  * `hooks/useSelectionEngine.ts` (Logika Select, Drag/Move, & Resize Objek)
* **Tanggung Jawab Utama:**
  1. Inisialisasi repositori Next.js (App Router), Tailwind CSS, dan Redux Toolkit.
  2. Membangun komponen HTML5 Canvas yang dapat menangani gestur *Pan & Zoom* secara presisi.
  3. Menghubungkan coretan pensil bebas (*freehand stroke*) dan bentuk geometris ke mesin render `Rough.js`.
  4. Mengatur skema data elemen di Redux (`canvasSlice`) dan menangani logika interaksi *Selection/Drag*.

### 👤 Orang 2: Frontend UI Component & Toolset Engine
* **Fokus Utama:** Antarmuka visual (Custom Tailwind CSS), Toolbar melayang, Panel Properti, dan fitur alat menggambar.
* **Area Kepemilikan Kode (*Code Ownership*):**
  * `store/slices/toolSlice.ts` (State Alat Aktif, Warna, & Ukuran Stroke)
  * `components/ui/Navbar.tsx` & `components/ui/Toolbar.tsx` (Tailwind UI Kustom)
  * `components/properties/PropertyPanel.tsx` (Color Picker & Stroke Width Selector)
  * `components/tools/` (`TextTool.tsx`, `StickyNote.tsx`, `Eraser.tsx`, `Highlighter.tsx`)
  * `hooks/useKeyboardShortcuts.ts` (Pintasan Tombol Keyboard V, P, R, T, Space, Ctrl+Z, Ctrl+Y)

### 👤 Orang 3: Storage, Export Engine, & Performance Optimization
* **Fokus Utama:** Penyimpanan lokal offline-first, ekspor file, halaman daftar board, dan optimasi framerate.
* **Area Kepemilikan Kode (*Code Ownership*):**
  * `lib/db.ts` (Integrasi Dexie.js / IndexedDB)
  * `store/middleware/indexedDbSync.ts` (Autosave Redux State ke IndexedDB)
  * `lib/exportEngine.ts` (Logika Konversi Canvas/Redux State ke PNG, SVG, JSON)
  * `app/page.tsx` (Landing Page & Manajemen Riwayat Board)
  * `lib/viewportCulling.ts` (Algoritma Filter Objek Terlihat untuk 60 FPS)

---

## 3. Spesifikasi Teknologi (Tech Stack)

| Kategori | Teknologi Utama | Keterangan & Aturan |
| :--- | :--- | :--- |
| **Framework utama** | **Next.js 15+ (App Router)** | Selalu gunakan Client Components (`'use client'`) untuk komponen Canvas & Tooling. |
| **State Management** | **Redux Toolkit (`@reduxjs/toolkit` + `react-redux`)** | **DILARANG mengimpor Zustand.** Semua state aplikasi terpusat di Redux Slices. |
| **Canvas Engine** | **HTML5 Canvas 2D Context API + `Rough.js`** | `Rough.js` digunakan untuk memberikan gaya lukisan/coretan tangan (*hand-drawn/sketchy*). |
| **Styling & UI** | **Tailwind CSS (Custom Components)** | **DILARANG mengimpor Shadcn UI.** Semua tombol, modal, dan toolbar ditulis murni dengan Tailwind CSS. |
| **Penyimpanan Lokal** | **Dexie.js (IndexedDB)** | Menyimpan data board secara *offline-first* di browser pengguna. |
| **Icons & Assets** | **Lucide React** | Gunakan ikon dari `lucide-react`. |

---

## 4. Tujuan Proyek & Metrik Keberhasilan (KPIs)

| Kategori Metrik | Metrik Khusus | Target Keberhasilan |
| :--- | :--- | :--- |
| **Performa Rendering** | FPS Kanvas saat Pengeditan | $\ge 60\text{ FPS}$ (hingga 1.000 objek aktif) |
| **Pengalaman Pengguna** | Waktu Muat hingga Coretan Pertama | $< 3\text{ detik}$ |
| **Handal & Stabil** | Autosave Reliability | $0\%$ kehilangan data saat browser ditutup mendadak |

---

## 5. Alur Pengguna (User Journey)

```text
[ Pengunjung Masuk Halaman Utama (app/page.tsx) ]
                 │
                 ├──► [ Klik "Buat Papan Baru" ] ──► Masuk ke Workspace Board (app/board/[id]/page.tsx)
                 │                                            │
                 └──► [ Pilih Board Lama ] ───────────────────┤
                                                              │
                                                              ▼
                                             ┌──────────────────────────────────┐
                                             │         RUANG KANVAS             │
                                             │  - Menggambar, Pan, Zoom         │
                                             │  - Select, Move, Resize Objek    │
                                             │  - Redux State Dispatch          │
                                             └──────────────────────────────────┘
                                                              │
                                                ┌─────────────┴─────────────┐
                                                ▼                           ▼
                                    [ Autosave 2 Detik ]        [ Klik "Simpan/Ekspor" ]
                                                │                           │
                                    Redux Middleware Sync       Ekspor ke PNG / SVG / JSON
                                    ke Dexie.js (IndexedDB)     via exportEngine.ts
```

---

## 6. Persyaratan Fungsional (Functional Requirements)

### 6.1 Mesin Kanvas & Redux State (Modul Orang 1)
* **[FE-01.1] Transformasi Matriks Pan & Zoom:**
  * Mendukung pergeseran kanvas (*Pan*) via drag klik-tengah mouse, scroll, atau menahan tombol `Spasi`.
  * Mendukung pembesaran/pengecilan (*Zoom*) dari $10\%$ hingga $3000\%$ relatif terhadap koordinat pointer mouse.
* **[FE-01.2] Redux Canvas Slice (`canvasSlice.ts`):**
  * Struktur state menampung array dari elemen kanvas:
    ```typescript
    interface CanvasElement {
      id: string;
      type: 'freehand' | 'rectangle' | 'ellipse' | 'line' | 'text' | 'sticky';
      x: number;
      y: number;
      width?: number;
      height?: number;
      points?: { x: number; y: number }[]; // Untuk freehand
      strokeColor: string;
      fillColor: string;
      strokeWidth: number;
      roughness: number;
      text?: string;
    }

    interface CanvasState {
      elements: CanvasElement[];
      selectedElementIds: string[];
      panOffset: { x: number; y: number };
      zoomLevel: number;
      history: CanvasElement[][];
      historyIndex: number;
    }
    ```
* **[FE-01.3] Selection & Manipulation Engine:**
  * Klik pada objek akan memunculkan *bounding box* selection.
  * Mendukung pergeseran objek (*Drag/Move*) dan penyesualian ukuran (*Resize*) pada titik sudut *bounding box*.

### 6.2 UI Tools & Shortcuts (Modul Orang 2)
* **[FE-02.1] Custom Tailwind Floating Toolbar:** Toolbar melayang di atas kanvas dengan opsi tool: *Select (V), Pan (H), Pen (P), Rectangle (R), Ellipse (O), Text (T), Sticky Note (S), Eraser (E)*.
* **[FE-02.2] Undo / Redo History:** Redux Toolkit mengelola tumpukan riwayat (*history stack*) untuk menangani `Ctrl+Z` (Undo) dan `Ctrl+Y` / `Ctrl+Shift+Z` (Redo).

### 6.3 Persistence & Export (Modul Orang 3)
* **[FE-03.1] Redux-IndexedDB Autosave:** State dari `canvasSlice` disinkronkan ke Dexie.js secara otomatis tiap 2 detik jika ada perubahan.
* **[FE-03.2] Multi-Format Export:** Mengonversi data Redux/Canvas menjadi file download PNG (skala 1x, 2x, 3x), SVG Vektor, atau JSON backup.

---

## 7. Persyaratan Non-Fungsional (NFR)

* **Performa:** Waktu muat awal $< 1,5\text{ detik}$, framerate $\ge 60\text{ FPS}$ saat panning & zooming.
* **Usabilitas:** Tampilan responsif dengan Tailwind CSS, mendukung mode gelap (*Dark Mode*), dan pintasan keyboard standar.
* **Kedaulatan Data:** Seluruh file tersimpan secara lokal di browser pengguna tanpa pelacakan (*zero telemetry*).

---

## 8. Rencana Sprint Agile Fase 1 (3 Minggu)

```text
[ SPRINT 1: FONDASI CORE ] ──────► [ SPRINT 2: TOOLSET & REDUX ] ──────► [ SPRINT 3: PERSISTENCE & POLISH ]
   Minggu 1: Focus Orang 1           Minggu 2: Focus Orang 2                 Minggu 3: Focus Orang 3
   - Setup Next.js & Redux Store     - Custom Tailwind Toolbar               - Redux-IndexedDB Autosave
   - HTML5 Canvas & Rough.js Math    - Text Tool & Sticky Notes              - Export PNG/SVG/JSON Engine
   - Pan/Zoom Matrix Transformation  - Redux Undo/Redo & Shortcuts           - Viewport Culling 60 FPS
```

### Detail Tugas Per Sprint:
* **Sprint 1 (Minggu 1):** Focus Orang 1 mendirikan repo, Redux Store (`canvasSlice`), komponen `WhiteboardCanvas.tsx`, dan matematika Pan/Zoom.
* **Sprint 2 (Minggu 2):** Focus Orang 2 membangun Toolbar kustom Tailwind, alat menggambar (Shapes, Text, Sticky Notes), dan pintasan keyboard.
* **Sprint 3 (Minggu 3):** Focus Orang 3 mengintegrasikan Dexie.js IndexedDB autosave middleware, modul ekspor PNG/SVG/JSON, dan Landing Page (`/`).

---

## 9. Analisis Risiko & Mitigasi

| Identifikasi Risiko | Tingkat Dampak | Strategi Mitigasi |
| :--- | :--- | :--- |
| **Performa Kanvas Melambat saat Banyak Objek** | Tinggi | Terapkan teknik *viewport culling* ketat (hanya me-render objek yang ada dalam kotak tampilan layar via `viewportCulling.ts`). |
| **Offset Mouse Salah Saat Zoom/Pan** | Tinggi | Gunakan perhitungan matriks transformasi tersentralisasi di `lib/matrixMath.ts` untuk konversi koordinat layar ke koordinat kanvas. |
| **State Redux Terlalu Besar** | Sedang | Simpan hanya elemen geometri murni (koordinat, poin, warna) di Redux, hindari menyimpan instance DOM/Canvas langsung. |

---

## 10. Instruksi Khusus untuk AI Agent (Prompt Context)

> **PETUNJUK UNTUK AI AGENT (Cursor / Windsurf / Gemini / Copilot):**
> 
> Saat pengguna (**Orang 1 / Team Lead**) meminta Anda menggenerasi kode:
> 1. **Gunakan Redux Toolkit** (`@reduxjs/toolkit` dan `react-redux`) untuk semua pengelolaan state. Jangan pernah menyarankan atau membuat kode menggunakan Zustand.
> 2. **Gunakan Tailwind CSS Murni** untuk komponen UI. Jangan mengimpor komponen dari `@/components/ui` bawaan Shadcn UI.
> 3. **Fokus pada Modul Orang 1:** Utamakan pembuatan file `store/slices/canvasSlice.ts`, `components/canvas/WhiteboardCanvas.tsx`, `lib/roughEngine.ts`, dan logika transformasi matriks (Pan/Zoom) yang presisi.
> 4. **Pastikan Komponen Canvas bertanda `'use client'`** karena Canvas API membutuhkan objek browser `window` dan `document`.
> 5. Jaga agar kode bersifat modular, ter-type dengan jelas (TypeScript strict), dan bebas *bug* kalkulasi offset koordinat mouse.

---
*Dokumen PRD Selesai.*
