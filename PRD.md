# Product Requirement Document (PRD) — OpenBoard

---

## 1. Ringkasan Eksekutif & Informasi Proyek

- **Nama Proyek:** OpenBoard (Working Title)
- **Tanggal Update:** 30 Juli 2026
- **Status Proyek:** Fase 1 (MVP Single-Player Whiteboard)
- **Target Waktu Eksekusi:** 3 Minggu (3 Sprint Agile)
- **Pola Kerja Tim:** 3 Orang (1 Team Lead Core Engine, 1 Frontend UI/Tools, 1 Storage/Export)

---

## 2. Struktur Tim & Pembagian Modul Kode (Team Division)

Proyek ini dikerjakan oleh **3 orang pengembang**. Setiap pengembang memiliki batas tanggung jawab (_code ownership_) yang jelas untuk menghindari konflik repositori Git:

### 👤 Orang 1: Team Lead & Canvas Core Engine (**PERAN ANDA / USER**)

- **Fokus Utama:** Fondasi aplikasi, arsitektur Redux Store, transformasi matematika kanvas, dan mesin render `Rough.js`.
- **Area Kepemilikan Kode (_Code Ownership_):**
  - `app/board/[id]/page.tsx` (Core Workspace Page Setup)
  - `store/index.ts` & `store/slices/canvasSlice.ts` (Core State Objek Kanvas)
  - `components/canvas/WhiteboardCanvas.tsx` (Komponen Utama Canvas API)
  - `lib/roughEngine.ts` (Integrasi Rendering Rough.js)
  - `lib/matrixMath.ts` (Kalkulasi Koordinat Mouse, Pan, & Zoom Matrix)
  - `hooks/useSelectionEngine.ts` (Logika Select, Drag/Move, & Resize Objek)
- **Tanggung Jawab Utama:**
  1. Inisialisasi repositori Next.js (App Router), Tailwind CSS, dan Redux Toolkit.
  2. Membangun komponen HTML5 Canvas yang dapat menangani gestur _Pan & Zoom_ secara presisi.
  3. Menghubungkan coretan pensil bebas (_freehand stroke_) dan bentuk geometris ke mesin render `Rough.js`.
  4. Mengatur skema data elemen di Redux (`canvasSlice`) dan menangani logika interaksi _Selection/Drag_.

### 👤 Orang 2: Frontend UI Component & Toolset Engine

- **Fokus Utama:** Antarmuka visual (Custom Tailwind CSS), Toolbar melayang, Panel Properti, dan fitur alat menggambar.
- **Area Kepemilikan Kode (_Code Ownership_):**
  - `store/slices/toolSlice.ts` (State Alat Aktif, Warna, & Ukuran Stroke)
  - `components/ui/Navbar.tsx` & `components/ui/Toolbar.tsx` (Tailwind UI Kustom)
  - `components/properties/PropertyPanel.tsx` (Color Picker & Stroke Width Selector)
  - `components/tools/` (`TextTool.tsx`, `StickyNote.tsx`, `Eraser.tsx`, `Highlighter.tsx`)
  - `hooks/useKeyboardShortcuts.ts` (Pintasan Tombol Keyboard V, P, R, T, Space, Ctrl+Z, Ctrl+Y)

### 👤 Orang 3: Storage, Export Engine, & Performance Optimization

- **Fokus Utama:** Penyimpanan lokal offline-first, ekspor file, halaman daftar board, dan optimasi framerate.
- **Area Kepemilikan Kode (_Code Ownership_):**
  - `lib/db.ts` (Integrasi Dexie.js / IndexedDB)
  - `store/middleware/indexedDbSync.ts` (Autosave Redux State ke IndexedDB)
  - `lib/exportEngine.ts` (Logika Konversi Canvas/Redux State ke PNG, SVG, JSON)
  - `app/page.tsx` (Landing Page & Manajemen Riwayat Board)
  - `lib/viewportCulling.ts` (Algoritma Filter Objek Terlihat untuk 60 FPS)

---

## 3. Spesifikasi Teknologi (Tech Stack)

| Kategori              | Teknologi Utama                                        | Keterangan & Aturan                                                                                   |
| :-------------------- | :----------------------------------------------------- | :---------------------------------------------------------------------------------------------------- |
| **Framework utama**   | **Next.js 16+ (App Router)**                           | Selalu gunakan Client Components (`'use client'`) untuk komponen Canvas & Tooling.                    |
| **State Management**  | **Redux Toolkit (`@reduxjs/toolkit` + `react-redux`)** | **DILARANG mengimpor Zustand.** Semua state aplikasi terpusat di Redux Slices.                        |
| **Canvas Engine**     | **HTML5 Canvas 2D Context API + `Rough.js`**           | `Rough.js` digunakan untuk memberikan gaya lukisan/coretan tangan (_hand-drawn/sketchy_).             |
| **Styling & UI**      | **Tailwind CSS (Custom Components)**                   | **DILARANG mengimpor Shadcn UI.** Semua tombol, modal, dan toolbar ditulis murni dengan Tailwind CSS. |
| **Penyimpanan Lokal** | **Dexie.js (IndexedDB)**                               | Menyimpan data board secara _offline-first_ di browser pengguna.                                      |
| **Icons & Assets**    | **Lucide React**                                       | Gunakan ikon dari `lucide-react`.                                                                     |

---

## 4. Persyaratan Fungsional (Functional Requirements)

### 4.1 Mesin Kanvas & Redux State (Modul Orang 1)

- **[FE-01.1] Transformasi Matriks Pan & Zoom:**
  - Mendukung pergeseran kanvas (_Pan_) via drag klik-tengah mouse, scroll, atau menahan tombol `Spasi`.
  - Mendukung pembesaran/pengecilan (_Zoom_) dari $10\%$ hingga $3000\%$ relatif terhadap koordinat pointer mouse.
- **[FE-01.2] Redux Canvas Slice (`canvasSlice.ts`):**
  - Struktur state harus menampung array dari elemen kanvas:
    ```typescript
    interface CanvasElement {
      id: string
      type: 'freehand' | 'rectangle' | 'ellipse' | 'line' | 'text' | 'sticky'
      x: number
      y: number
      width?: number
      height?: number
      points?: { x: number; y: number }[] // Untuk freehand
      strokeColor: string
      fillColor: string
      strokeWidth: number
      roughness: number
      text?: string
    }
    ```
- **[FE-01.3] Selection & Manipulation Engine:**
  - Klik pada objek akan memunculkan _bounding box_ selection.
  - Mendukung pergeseran objek (_Drag/Move_) dan penyesuaian ukuran (_Resize_) pada titik sudut _bounding box_.

### 4.2 UI Tools & Shortcuts (Modul Orang 2)

- **[FE-02.1] Custom Tailwind Floating Toolbar:** Toolbar melayang di atas kanvas dengan opsi tool: _Select (V), Pan (H), Pen (P), Rectangle (R), Ellipse (O), Text (T), Sticky Note (S), Eraser (E)_.
- **[FE-02.2] Undo / Redo History:** Redux Toolkit mengelola tumpukan riwayat (_history stack_) untuk menangani `Ctrl+Z` (Undo) dan `Ctrl+Y` / `Ctrl+Shift+Z` (Redo).

### 4.3 Persistence & Export (Modul Orang 3)

- **[FE-03.1] Redux-IndexedDB Autosave:** State dari `canvasSlice` disinkronkan ke Dexie.js secara otomatis tiap 2 detik jika ada perubahan.
- **[FE-03.2] Multi-Format Export:** Mengonversi data Redux/Canvas menjadi file download PNG (skala 1x, 2x, 3x), SVG Vektor, atau JSON backup.

---

## 5. Rencana Sprint Agile Fase 1 (3 Minggu)

```
[ SPRINT 1: FONDASI CORE ] ──────► [ SPRINT 2: TOOLSET & REDUX ] ──────► [ SPRINT 3: PERSISTENCE & POLISH ]
   Minggu 1: Focus Orang 1           Minggu 2: Focus Orang 2                 Minggu 3: Focus Orang 3
   - Setup Next.js & Redux Store     - Custom Tailwind Toolbar               - Redux-IndexedDB Autosave
   - HTML5 Canvas & Rough.js Math    - Text Tool & Sticky Notes              - Export PNG/SVG/JSON Engine
   - Pan/Zoom Matrix Transformation  - Redux Undo/Redo & Shortcuts           - Viewport Culling 60 FPS
```

---

## 6. Instruksi Khusus untuk AI Agent (Prompt Context)

> **PETUNJUK UNTUK AI AGENT (Cursor / Windsurf / Gemini / Copilot):**
>
> Saat pengguna (**Orang 1 / Team Lead**) meminta Anda menggenerasi kode:
>
> 1. **Gunakan Redux Toolkit** (`@reduxjs/toolkit` dan `react-redux`) untuk semua pengelolaan state. Jangan pernah menyarankan atau membuat kode menggunakan Zustand.
> 2. **Gunakan Tailwind CSS Murni** untuk komponen UI. Jangan mengimpor komponen dari `@/components/ui` bawaan Shadcn UI.
> 3. **Fokus pada Modul Orang 1:** Utamakan pembuatan file `store/slices/canvasSlice.ts`, `components/canvas/WhiteboardCanvas.tsx`, `lib/roughEngine.ts`, dan logika transformasi matriks (Pan/Zoom) yang presisi.
> 4. **Pastikan Komponen Canvas bertanda `'use client'`** karena Canvas API membutuhkan objek browser `window` dan `document`.
> 5. Jaga agar kode bersifat modular, ter-type dengan jelas (TypeScript strict), dan bebas _bug_ kalkulasi offset koordinat mouse.

---

_Dokumen PRD Selesai._
