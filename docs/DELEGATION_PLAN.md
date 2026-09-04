# Plan Delegasi — OpenBoard Fase 1 (MVP)

> Referensi: `PRD_OpenBoard_Full.md` v1.2.0. Status Orang 1 (Core Engine) **selesai 100%**.
> Dokumen ini mengalokasikan sisa pekerjaan ke Orang 2 dan Orang 3.

---

## Status Orang 1 — Core Engine (SELESAI)

| PRD Ref | Item | Status |
| :--- | :--- | :--- |
| FE-01.1 | Pan (klik-tengah / Spasi / tool Pan) + Zoom 10–3000% relatif pointer | ✅ |
| FE-01.2 | `canvasSlice.ts` (elements, selectedElementIds, panOffset, zoomLevel, history) | ✅ |
| FE-01.3 | Selection, drag/move, resize + bounding box | ✅ |
| FE-01.3 | Undo/Redo reducer + shortcut Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y | ✅ |
| NFR | Viewport culling (`viewportCulling.ts`) ter-wire di `draw()` | ✅ |
| — | Rough.js render semua elemen (freehand, rectangle, ellipse, line, text, sticky) | ✅ |
| — | Text & sticky click-to-place, eraser, Pen | ✅ |

---

## Delegasi Orang 2 — Frontend UI & Toolset

**Kepemilikan:** `toolSlice.ts`, `Navbar.tsx`, `Toolbar.tsx`, `PropertyPanel.tsx`, `ProperyColors.tsx`, `tools/`

| No | Tugas | Prioritas | Detail |
| :-- | :--- | :--- | :--- |
| 2.1 | Wire `PropertyPanel.tsx` ke board page | Tinggi | Color picker + stroke width sudah berfungsi tapi belum dipakai. Render di `/board/[id]`, dispatch `setStrokeColor`/`setStrokeWidth`. |
| 2.2 | Sambungkan `ProperyColors.tsx` ke Redux | Tinggi | Swatch warna → `setStrokeColor`/`setFillColor`; stroke 1–3 → `setStrokeWidth`; toggle SKETCH/CLEAN → `setRoughness`. |
| 2.3 | Wire `Toolbar.tsx` (floating) | Sedang | Sudah berisi 8 tool + dispatch, tapi yatim. Putuskan: pakai `Toolbar` melayang (PRD FE-02.1) ATAU pertahankan `Sidebar`. Jangan duplikasi. |
| 2.4 | Rapikan komponen `tools/` | Sedang | `TextTool.tsx`, `StickyNote.tsx`, `Eraser.tsx`, `Highlighter.tsx` belum dipakai. Integrasikan atau hapus. |
| 2.5 | Palette warna kustom | Rendah | Warna default `#000000`; tambah preset palette neobrutalist (accent-blue/red/yellow/green/peach). |

## Delegasi Orang 3 — Storage, Export, Performance

**Kepemilikan:** `lib/db.ts`, `store/middleware/indexedDbSync.ts`, `lib/exportEngine.ts`, `app/page.tsx`, `lib/viewportCulling.ts`

| No | Tugas | Prioritas | Detail |
| :-- | :--- | :--- | :--- |
| 3.1 | Load board saat buka `/board/[id]` | **Tertinggi** | Autosave sudah jalan (2 detik) tapi **belum ada load**. Panggil `loadBoard(id)` di board page, dispatch `setElements` + restore `selectedElementIds`. |
| 3.2 | Export PNG (1x/2x/3x) | Tinggi | `exportEngine.ts` baru punya JSON. Render canvas offscreen, `toBlob`/`toDataURL`, trigger download. |
| 3.3 | Export SVG vektor | Sedang | Konversi `CanvasElement[]` → SVG path/text. |
| 3.4 | Landing page daftar board | Sedang | `app/page.tsx` pakai `getAllBoards()` → grid board, klik buka `/board/[id]`. |
| 3.5 | Tombol Simpan/Ekspor di UI | Sedang | Tempatkan di `Navbar.tsx` (modul Orang 2 — koordinasi). |

---

## Catatan Koordinasi
- **Conflict `Toolbar.tsx` vs `Sidebar.tsx`** (2.3): hanya satu yang dirender di board page.
- **3.5 membutuhkan koordinasi** antara Orang 2 (UI) dan Orang 3 (engine).
- Jangan ubah `canvasSlice.ts`, `WhiteboardCanvas.tsx`, `roughEngine.ts`, `matrixMath.ts` tanpa koordinasi dengan Orang 1.
