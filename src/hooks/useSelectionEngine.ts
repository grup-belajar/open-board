'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { commitHistory, setElements, setSelectedElementIds } from '../store/slices/canvasSlice';
import type { CanvasElement } from '../store/slices/canvasSlice';
import type { Matrix2D } from '../lib/matrixMath';
import { screenToWorld, worldToScreen } from '../lib/matrixMath';
import { getElementBounds, hitTest, mergeBounds } from '../lib/geometry';

const RESIZE_HIT_SLOP = 8;

type ResizeCorner = 'nw' | 'ne' | 'se' | 'sw';
type InteractionMode = 'idle' | 'moving' | 'resizing';

interface DragState {
  mode: InteractionMode;
  corner?: ResizeCorner;
  startWorld: { x: number; y: number };
  originals: CanvasElement[];
  startBounds?: { minX: number; minY: number; maxX: number; maxY: number };
}

interface SelectionEngineProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  getMatrix: () => Matrix2D;
  redraw: () => void;
  isPanGesture: (event: PointerEvent) => boolean;
  enabled?: boolean;
}

export default function useSelectionEngine({ canvasRef, getMatrix, redraw, isPanGesture, enabled = true }: SelectionEngineProps) {
  const dispatch = useAppDispatch();
  const elements = useAppSelector((state) => state.canvas.elements);
  const selectedElementIds = useAppSelector((state) => state.canvas.selectedElementIds);

  const stateRef = useRef<DragState>({ mode: 'idle', startWorld: { x: 0, y: 0 }, originals: [] });
  const elementsRef = useRef(elements);
  const selectionRef = useRef(selectedElementIds);

  useEffect(() => {
    elementsRef.current = elements;
  }, [elements]);

  useEffect(() => {
    selectionRef.current = selectedElementIds;
  }, [selectedElementIds]);

  const getCanvasPoint = useCallback((event: PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }, [canvasRef]);

  const getResizeCorner = useCallback(
    (point: { x: number; y: number }): ResizeCorner | null => {
      const selected = elementsRef.current.filter((el) => selectionRef.current.includes(el.id));
      if (selected.length === 0) return null;
      const merged = mergeBounds(selected.map((el) => getElementBounds(el)));
      if (!merged) return null;

      const m = getMatrix();
      const tl = worldToScreen(merged.minX, merged.minY, m);
      const br = worldToScreen(merged.maxX, merged.maxY, m);
      const corners: [ResizeCorner, number, number][] = [
        ['nw', tl.x, tl.y],
        ['ne', br.x, tl.y],
        ['se', br.x, br.y],
        ['sw', tl.x, br.y],
      ];
      for (const [corner, cx, cy] of corners) {
        if (Math.abs(point.x - cx) <= RESIZE_HIT_SLOP && Math.abs(point.y - cy) <= RESIZE_HIT_SLOP) {
          return corner;
        }
      }
      return null;
    },
    [getMatrix]
  );

  const onPointerDown = useCallback((event: PointerEvent) => {
    if (!enabled) return;
    if (isPanGesture(event)) return;
    if (event.button !== 0) return;
    if (canvasRef.current) canvasRef.current.setPointerCapture(event.pointerId);

    const point = getCanvasPoint(event);
    const world = screenToWorld(point.x, point.y, getMatrix());

    const corner = getResizeCorner(point);
    const selected = elementsRef.current.filter((el) => selectionRef.current.includes(el.id));

    if (corner && selected.length > 0) {
      const merged = mergeBounds(selected.map((el) => getElementBounds(el)))!;
      stateRef.current = {
        mode: 'resizing',
        corner,
        startWorld: world,
        originals: selected.map((el) => ({ ...el })),
        startBounds: merged,
      };
      return;
    }

    const hit = [...elementsRef.current].reverse().find((el) => hitTest(el, world.x, world.y));

    if (hit) {
      const isAlreadySelected = selectionRef.current.includes(hit.id);
      if (!isAlreadySelected) {
        dispatch(setSelectedElementIds([hit.id]));
      } else if (selected.length > 1 && !event.shiftKey) {
        dispatch(setSelectedElementIds([hit.id]));
      }
      stateRef.current = {
        mode: 'moving',
        startWorld: world,
        originals: elementsRef.current
          .filter((el) => selectionRef.current.includes(el.id) || el.id === hit.id)
          .map((el) => ({ ...el })),
      };
      return;
    }

    dispatch(setSelectedElementIds([]));
    stateRef.current = { mode: 'idle', startWorld: world, originals: [] };
  }, [canvasRef, getMatrix, dispatch, isPanGesture, getCanvasPoint, getResizeCorner, enabled]);

  const onPointerMove = useCallback((event: PointerEvent) => {
    const state = stateRef.current;
    if (state.mode === 'idle') return;

    const point = getCanvasPoint(event);
    const world = screenToWorld(point.x, point.y, getMatrix());

    if (state.mode === 'moving') {
      const dx = world.x - state.startWorld.x;
      const dy = world.y - state.startWorld.y;
      const moved = state.originals.map((el) => {
        if (el.type === 'freehand' && el.points) {
          return {
            ...el,
            points: el.points.map((p) => ({ x: p.x + dx, y: p.y + dy })),
          };
        }
        return { ...el, x: el.x + dx, y: el.y + dy };
      });
      dispatch(setElements(moved));
      redraw();
      return;
    }

    if (state.mode === 'resizing' && state.corner && state.startBounds) {
      const b = state.startBounds;
      const { x, y } = world;
      const minX = state.corner.includes('w') ? x : b.minX;
      const minY = state.corner.includes('n') ? y : b.minY;
      const maxX = state.corner.includes('e') ? x : b.maxX;
      const maxY = state.corner.includes('s') ? y : b.maxY;

      const newMinX = Math.min(minX, maxX);
      const newMaxX = Math.max(minX, maxX);
      const newMinY = Math.min(minY, maxY);
      const newMaxY = Math.max(minY, maxY);

      const oldW = b.maxX - b.minX || 1;
      const oldH = b.maxY - b.minY || 1;

      const resized = state.originals.map((el) => {
        const eb = getElementBounds(el);
        const rx = (eb.minX - b.minX) / oldW;
        const ry = (eb.minY - b.minY) / oldH;
        const rw = (eb.maxX - b.minX) / oldW;
        const rh = (eb.maxY - b.minY) / oldH;

        const nMinX = newMinX + rx * (newMaxX - newMinX);
        const nMinY = newMinY + ry * (newMaxY - newMinY);
        const nMaxX = newMinX + rw * (newMaxX - newMinX);
        const nMaxY = newMinY + rh * (newMaxY - newMinY);

        if (el.type === 'line') {
          return {
            ...el,
            x: nMinX,
            y: nMinY,
            width: nMaxX - nMinX,
            height: nMaxY - nMinY,
          };
        }
        if (el.type === 'freehand' && el.points) {
          return {
            ...el,
            points: el.points.map((p) => ({
              x: newMinX + ((p.x - b.minX) / oldW) * (newMaxX - newMinX),
              y: newMinY + ((p.y - b.minY) / oldH) * (newMaxY - newMinY),
            })),
          };
        }
        return {
          ...el,
          x: nMinX,
          y: nMinY,
          width: Math.abs(nMaxX - nMinX),
          height: Math.abs(nMaxY - nMinY),
        };
      });

      dispatch(setElements(resized));
      redraw();
      return;
    }
  }, [getMatrix, dispatch, redraw, getCanvasPoint]);

  const onPointerUp = useCallback(() => {
    if (stateRef.current.mode !== 'idle') {
      dispatch(commitHistory());
    }
    stateRef.current = { mode: 'idle', startWorld: { x: 0, y: 0 }, originals: [] };
  }, [dispatch]);

  const resetInteraction = useCallback(() => {
    stateRef.current = { mode: 'idle', startWorld: { x: 0, y: 0 }, originals: [] };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', resetInteraction);
    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', resetInteraction);
    };
  }, [canvasRef, onPointerDown, onPointerMove, onPointerUp, resetInteraction]);
}
