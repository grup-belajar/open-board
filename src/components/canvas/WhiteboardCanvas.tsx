'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setPanZoom } from '../../store/slices/canvasSlice';
import { createRoughRenderer, drawElement } from '../../lib/roughEngine';
import { CanvasSceneCache } from '../../lib/canvasSceneCache';
import { getMatrixFromState, panByScroll, worldToScreen, zoomAtPoint } from '../../lib/matrixMath';
import { getElementBounds, mergeBounds } from '../../lib/geometry';
import type { CanvasElement } from '../../store/slices/canvasSlice';
import type { Matrix2D } from '../../lib/matrixMath';
import useSelectionEngine from '../../hooks/useSelectionEngine';
import useDrawingEngine from '../../hooks/useDrawingEngine';
import CanvasTextComposer from '../tools/CanvasTextComposer';

export default function WhiteboardCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const roughRef = useRef<ReturnType<typeof createRoughRenderer> | null>(null);
  const sceneCacheRef = useRef<CanvasSceneCache | null>(null);
  const matrixRef = useRef<Matrix2D>(getMatrixFromState({ x: 0, y: 0 }, 1));
  const spaceRef = useRef(false);
  const panState = useRef({ active: false, startX: 0, startY: 0 });
  const draftRef = useRef<CanvasElement | null>(null);
  const scheduledDrawRef = useRef<number | null>(null);
  const scheduledViewportSyncRef = useRef<number | null>(null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

  const dispatch = useAppDispatch();
  const elements = useAppSelector((state) => state.canvas.elements);
  const selectedElementIds = useAppSelector((state) => state.canvas.selectedElementIds);
  const panOffset = useAppSelector((state) => state.canvas.panOffset);
  const zoomLevel = useAppSelector((state) => state.canvas.zoomLevel);
  const activeTool = useAppSelector((state) => state.tool.activeTool);

  const elementsRef = useRef(elements);
  const selectionRef = useRef(selectedElementIds);
  const activeToolRef = useRef(activeTool);

  const syncViewport = useCallback(() => {
    if (scheduledViewportSyncRef.current !== null) return;

    scheduledViewportSyncRef.current = requestAnimationFrame(() => {
      scheduledViewportSyncRef.current = null;
      const matrix = matrixRef.current;
      dispatch(setPanZoom({ panOffset: { x: matrix.e, y: matrix.f }, zoomLevel: matrix.a }));
    });
  }, [dispatch]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    const rough = roughRef.current;
    if (!canvas || !ctx || !rough) return;

    const dpr = window.devicePixelRatio || 1;
    const m = matrixRef.current;

    if (!sceneCacheRef.current) sceneCacheRef.current = new CanvasSceneCache();
    sceneCacheRef.current.draw(
      ctx,
      elementsRef.current,
      m,
      { width: canvas.width / dpr, height: canvas.height / dpr },
      dpr
    );

    ctx.setTransform(dpr * m.a, dpr * m.b, dpr * m.c, dpr * m.d, dpr * m.e, dpr * m.f);

    const draft = draftRef.current;
    if (draft) drawElement(rough, ctx, draft, false);

    drawSelectionOverlay(ctx, elementsRef.current, selectionRef.current, m, dpr);
  }, []);

  const scheduleDraw = useCallback(() => {
    if (scheduledDrawRef.current !== null) return;

    scheduledDrawRef.current = requestAnimationFrame(() => {
      scheduledDrawRef.current = null;
      draw();
    });
  }, [draw]);

  useEffect(() => () => {
    if (scheduledDrawRef.current !== null) cancelAnimationFrame(scheduledDrawRef.current);
    if (scheduledViewportSyncRef.current !== null) cancelAnimationFrame(scheduledViewportSyncRef.current);
  }, []);

  useEffect(() => {
    elementsRef.current = elements;
    scheduleDraw();
  }, [elements, scheduleDraw]);

  useEffect(() => {
    selectionRef.current = selectedElementIds;
    scheduleDraw();
  }, [selectedElementIds, scheduleDraw]);

  useEffect(() => {
    activeToolRef.current = activeTool;
  }, [activeTool]);

  useEffect(() => {
    matrixRef.current = getMatrixFromState(panOffset, zoomLevel);
  }, [panOffset, zoomLevel]);

  const getCanvasPoint = useCallback((clientX: number, clientY: number) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  }, []);

  const getMatrix = useCallback(() => matrixRef.current, []);

  const isPanGesture = useCallback(
    (event: PointerEvent) =>
      event.button === 1 ||
      (event.button === 0 && (spaceRef.current || activeToolRef.current === 'pan')),
    []
  );

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctxRef.current = ctx;
    roughRef.current = createRoughRenderer(canvas);

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = container.clientWidth * dpr;
      canvas.height = container.clientHeight * dpr;
      setViewportSize((size) =>
        size.width === container.clientWidth && size.height === container.clientHeight
          ? size
          : { width: container.clientWidth, height: container.clientHeight }
      );
      scheduleDraw();
    };
    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(container);
    return () => observer.disconnect();
  }, [scheduleDraw]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space' && !spaceRef.current) {
        spaceRef.current = true;
        event.preventDefault();
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'Space') spaceRef.current = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (event.ctrlKey || event.metaKey) {
        const { x, y } = getCanvasPoint(event.clientX, event.clientY);
        const factor = Math.exp(-event.deltaY * 0.004);
        matrixRef.current = zoomAtPoint(matrixRef.current, factor, x, y);
      } else {
        matrixRef.current = panByScroll(matrixRef.current, event.deltaX, event.deltaY);
      }
      syncViewport();
      scheduleDraw();
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button === 1 || (event.button === 0 && (spaceRef.current || activeToolRef.current === 'pan'))) {
        event.preventDefault();
        panState.current = { active: true, startX: event.clientX, startY: event.clientY };
        canvas.setPointerCapture(event.pointerId);
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      const pan = panState.current;
      if (!pan.active) return;
      const m = matrixRef.current;
      m.e += event.clientX - pan.startX;
      m.f += event.clientY - pan.startY;
      pan.startX = event.clientX;
      pan.startY = event.clientY;
      syncViewport();
      scheduleDraw();
    };

    const onPointerUp = (event: PointerEvent) => {
      if (panState.current.active) {
        panState.current.active = false;
        canvas.releasePointerCapture(event.pointerId);
      }
    };

    const onContextMenu = (event: Event) => event.preventDefault();

    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('contextmenu', onContextMenu);
    return () => {
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('contextmenu', onContextMenu);
    };
  }, [getCanvasPoint, scheduleDraw, syncViewport]);

  const { textInputDraft, submitTextInput, cancelTextInput } = useDrawingEngine({
    canvasRef,
    draftRef,
    getMatrix,
    redraw: scheduleDraw,
    isPanGesture,
  });

  const selectionEnabled =
    activeTool !== 'pen' &&
    activeTool !== 'rectangle' &&
    activeTool !== 'ellipse' &&
    activeTool !== 'line' &&
    activeTool !== 'eraser' &&
    activeTool !== 'pan' &&
    activeTool !== 'text' &&
    activeTool !== 'sticky';

  useSelectionEngine({
    canvasRef,
    getMatrix,
    redraw: scheduleDraw,
    isPanGesture,
    enabled: selectionEnabled,
  });

  return (
    <div ref={containerRef} className="relative h-full w-full">
      <canvas
        ref={canvasRef}
        tabIndex={0}
        aria-label="Kanvas gambar OpenBoard. Pilih alat lalu klik untuk menambahkan objek."
        className={`h-full w-full focus-visible:outline focus-visible:outline-4 focus-visible:outline-accent-blue ${activeTool === 'pan' ? 'cursor-grab' : activeTool === 'select' ? 'cursor-default' : 'cursor-crosshair'}`}
        style={{
          touchAction: 'none',
          backgroundImage: 'radial-gradient(circle, var(--canvas-dot-color) 2px, transparent 2px)',
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0',
          backgroundAttachment: 'local ',
        }}
        data-testid="whiteboard-canvas"
      />
      {textInputDraft && (
        <CanvasTextComposer
          draft={textInputDraft}
          viewport={viewportSize}
          onSubmit={submitTextInput}
          onCancel={cancelTextInput}
        />
      )}
    </div>
  );
}

function drawSelectionOverlay(
  ctx: CanvasRenderingContext2D,
  elements: import('../../store/slices/canvasSlice').CanvasElement[],
  selectedIds: string[],
  matrix: Matrix2D,
  dpr: number
) {
  if (selectedIds.length === 0) return;
  const selected = elements.filter((el) => selectedIds.includes(el.id));
  if (selected.length === 0) return;

  const merged = mergeBounds(selected.map((el) => getElementBounds(el)));
  if (!merged) return;

  const tl = worldToScreen(merged.minX, merged.minY, matrix);
  const br = worldToScreen(merged.maxX, merged.maxY, matrix);
  const w = br.x - tl.x;
  const h = br.y - tl.y;

  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);
  ctx.strokeRect(tl.x, tl.y, w, h);
  ctx.setLineDash([]);

  const size = 8;
  ctx.fillStyle = '#3b82f6';
  for (const [hx, hy] of [
    [tl.x, tl.y],
    [tl.x + w, tl.y],
    [tl.x + w, tl.y + h],
    [tl.x, tl.y + h],
  ]) {
    ctx.fillRect(hx - size / 2, hy - size / 2, size, size);
  }
  ctx.restore();
}
