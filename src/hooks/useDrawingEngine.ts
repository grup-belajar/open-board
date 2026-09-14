'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addElement, deleteElement, setSelectedElementIds } from '../store/slices/canvasSlice';
import type { CanvasElement } from '../store/slices/canvasSlice';
import type { DrawingStyle } from '../store/slices/toolSlice';
import type { Matrix2D } from '../lib/matrixMath';
import { screenToWorld } from '../lib/matrixMath';
import { hitTest } from '../lib/geometry';

const MIN_SIZE = 2;
const DRAWING_TOOLS = new Set(['pen', 'rectangle', 'ellipse', 'line']);

interface DrawingEngineProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  draftRef: React.RefObject<CanvasElement | null>;
  getMatrix: () => Matrix2D;
  redraw: () => void;
  isPanGesture: (event: PointerEvent) => boolean;
}

function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export interface TextInputDraft {
  type: 'text' | 'sticky';
  x: number;
  y: number;
  screenX: number;
  screenY: number;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  roughness: number;
  initialText: string;
}

function roughnessForStyle(style: DrawingStyle): number {
  return style === 'clean' ? 0 : 1;
}

export default function useDrawingEngine({ canvasRef, draftRef, getMatrix, redraw, isPanGesture }: DrawingEngineProps) {
  const dispatch = useAppDispatch();
  const activeTool = useAppSelector((state) => state.tool.activeTool);
  const strokeColor = useAppSelector((state) => state.tool.strokeColor);
  const fillColor = useAppSelector((state) => state.tool.fillColor);
  const strokeWidth = useAppSelector((state) => state.tool.strokeWidth);
  const drawingStyle = useAppSelector((state) => state.tool.drawingStyle);
  const elements = useAppSelector((state) => state.canvas.elements);

  const toolRef = useRef(activeTool);
  const styleRef = useRef({ strokeColor, fillColor, strokeWidth, drawingStyle });
  const elementsRef = useRef(elements);
  const drawingRef = useRef(false);
  const [textInputDraft, setTextInputDraft] = useState<TextInputDraft | null>(null);

  useEffect(() => {
    toolRef.current = activeTool;
  }, [activeTool]);

  useEffect(() => {
    styleRef.current = { strokeColor, fillColor, strokeWidth, drawingStyle };
  }, [strokeColor, fillColor, strokeWidth, drawingStyle]);

  useEffect(() => {
    elementsRef.current = elements;
  }, [elements]);

  const getCanvasPoint = useCallback((event: PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }, [canvasRef]);

  const onPointerDown = useCallback(
    (event: PointerEvent) => {
      if (isPanGesture(event)) return;
      if (event.button !== 0) return;
      if (canvasRef.current) canvasRef.current.setPointerCapture(event.pointerId);

      const point = getCanvasPoint(event);
      const world = screenToWorld(point.x, point.y, getMatrix());

      if (toolRef.current === 'eraser') {
        const hit = [...elementsRef.current].reverse().find((el) => hitTest(el, world.x, world.y));
        if (hit) {
          dispatch(deleteElement(hit.id));
          dispatch(setSelectedElementIds([]));
          redraw();
        }
        return;
      }

      if (toolRef.current === 'text') {
        const style = styleRef.current;
        setTextInputDraft({
          type: 'text',
          x: world.x,
          y: world.y,
          screenX: point.x,
          screenY: point.y,
          strokeColor: style.strokeColor || '#000000',
          fillColor: 'transparent',
          strokeWidth: style.strokeWidth || 2,
          roughness: roughnessForStyle(style.drawingStyle),
          initialText: 'Text',
        });
        return;
      }

      if (toolRef.current === 'sticky') {
        const style = styleRef.current;
        setTextInputDraft({
          type: 'sticky',
          x: world.x,
          y: world.y,
          screenX: point.x,
          screenY: point.y,
          strokeColor: style.strokeColor || '#000000',
          fillColor: style.fillColor === 'transparent' ? '#fef08a' : style.fillColor,
          strokeWidth: style.strokeWidth || 2,
          roughness: roughnessForStyle(style.drawingStyle),
          initialText: 'Catatan baru',
        });
        return;
      }

      if (!DRAWING_TOOLS.has(toolRef.current)) return;

      const style = styleRef.current;
      const base = {
        id: newId(),
        x: world.x,
        y: world.y,
        strokeColor: style.strokeColor,
        fillColor: style.fillColor,
        strokeWidth: style.strokeWidth,
        roughness: roughnessForStyle(style.drawingStyle),
      };

      if (toolRef.current === 'pen') {
        draftRef.current = {
          ...base,
          type: 'freehand',
          points: [{ x: world.x, y: world.y }],
        };
      } else {
        draftRef.current = {
          ...base,
          type: toolRef.current as 'rectangle' | 'ellipse' | 'line',
          width: 0,
          height: 0,
        };
      }

      drawingRef.current = true;
      redraw();
    },
    [canvasRef, getMatrix, dispatch, redraw, isPanGesture, getCanvasPoint, draftRef]
  );

  const onPointerMove = useCallback(
    (event: PointerEvent) => {
      if (!drawingRef.current) return;
      const draft = draftRef.current;
      if (!draft) return;

      const point = getCanvasPoint(event);
      const world = screenToWorld(point.x, point.y, getMatrix());

      if (draft.type === 'freehand' && draft.points) {
        draft.points.push({ x: world.x, y: world.y });
      } else {
        draft.width = world.x - draft.x;
        draft.height = world.y - draft.y;
      }
      redraw();
    },
    [getMatrix, redraw, getCanvasPoint, draftRef]
  );

  const onPointerUp = useCallback(() => {
    if (!drawingRef.current) return;
    drawingRef.current = false;

    const draft = draftRef.current;
    draftRef.current = null;
    if (!draft) return;

    if (draft.type === 'freehand') {
      if ((draft.points?.length ?? 0) < 2) return;
      dispatch(addElement(draft));
      redraw();
      return;
    }

    const width = draft.width ?? 0;
    const height = draft.height ?? 0;
    if (Math.abs(width) < MIN_SIZE && Math.abs(height) < MIN_SIZE) return;

    let final: CanvasElement = draft;
    if (draft.type !== 'line') {
      final = {
        ...draft,
        x: Math.min(draft.x, draft.x + width),
        y: Math.min(draft.y, draft.y + height),
        width: Math.abs(width),
        height: Math.abs(height),
      };
    }
    dispatch(addElement(final));
    redraw();
  }, [dispatch, redraw, draftRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
    };
  }, [canvasRef, onPointerDown, onPointerMove, onPointerUp]);

  const cancelTextInput = useCallback(() => {
    setTextInputDraft(null);
    canvasRef.current?.focus();
  }, [canvasRef]);

  const submitTextInput = useCallback((value: string) => {
    const input = textInputDraft;
    const text = value.trimEnd();

    if (!input || (input.type === 'text' && !text.trim())) {
      setTextInputDraft(null);
      canvasRef.current?.focus();
      return;
    }

    dispatch(addElement({
      id: newId(),
      type: input.type,
      x: input.x,
      y: input.y,
      ...(input.type === 'sticky' ? { width: 160, height: 120 } : {}),
      strokeColor: input.strokeColor,
      fillColor: input.fillColor,
      strokeWidth: input.strokeWidth,
      ...(input.type === 'text' ? { fontSize: Math.max(12, input.strokeWidth * 6) } : {}),
      roughness: input.roughness,
      text: text.trim() ? text : 'Catatan',
    }));
    setTextInputDraft(null);
    canvasRef.current?.focus();
    redraw();
  }, [canvasRef, dispatch, redraw, textInputDraft]);

  return { textInputDraft, submitTextInput, cancelTextInput };
}
