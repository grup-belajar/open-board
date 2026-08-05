'use client';

import { useEffect, useRef, useState } from 'react';
import { useAppSelector } from '../../store/hooks';
import { createRoughRenderer, drawFreehand } from '../../lib/roughEngine';

export default function WhiteboardCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const elements = useAppSelector((state) => state.canvas.elements);
  const [scale] = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const roughCanvas = createRoughRenderer(canvas);

    for (const el of elements) {
      if (el.type === 'freehand' && el.points) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        drawFreehand(roughCanvas, el.points, el.strokeColor, el.strokeWidth, el.roughness);
      }
    }
  }, [elements, scale]);

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full"
      data-testid="whiteboard-canvas"
    />
  );
}