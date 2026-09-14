import type { RoughCanvas } from 'roughjs/bin/canvas';
import type { CanvasElement } from '../store/slices/canvasSlice';
import type { Matrix2D } from './matrixMath';
import { createRoughRenderer, drawElement } from './roughEngine';
import { getVisibleElements } from './viewportCulling';

interface CachedScene {
  canvas: HTMLCanvasElement;
  elements: CanvasElement[];
  anchorScale: number;
  anchorX: number;
  anchorY: number;
  viewportWidth: number;
  viewportHeight: number;
  devicePixelRatio: number;
  cachePixelRatio: number;
}

const CACHE_MARGIN = 192;
const MIN_CACHE_SCALE_RATIO = 0.85;
const MAX_CACHE_SCALE_RATIO = 1.15;
const MAX_CACHE_DIMENSION = 8192;
const MAX_CACHE_PIXELS = 24_000_000;

export class CanvasSceneCache {
  private cachedScene: CachedScene | null = null;

  draw(
    context: CanvasRenderingContext2D,
    elements: CanvasElement[],
    matrix: Matrix2D,
    viewport: { width: number; height: number },
    devicePixelRatio: number
  ): void {
    let scene = this.cachedScene;
    if (!scene || !this.canReuse(scene, elements, matrix, viewport, devicePixelRatio)) {
      scene = this.createScene(elements, matrix, viewport, devicePixelRatio);
      this.cachedScene = scene;
    }

    const scaleRatio = matrix.a / scene.anchorScale;
    const sourceLeft = scene.cachePixelRatio * (scene.anchorX + CACHE_MARGIN - matrix.e / scaleRatio);
    const sourceTop = scene.cachePixelRatio * (scene.anchorY + CACHE_MARGIN - matrix.f / scaleRatio);
    const sourceWidth = viewport.width * scene.cachePixelRatio / scaleRatio;
    const sourceHeight = viewport.height * scene.cachePixelRatio / scaleRatio;

    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.globalCompositeOperation = 'copy';
    context.drawImage(
      scene.canvas,
      sourceLeft,
      sourceTop,
      sourceWidth,
      sourceHeight,
      0,
      0,
      viewport.width * devicePixelRatio,
      viewport.height * devicePixelRatio
    );
    context.restore();
  }

  private canReuse(
    scene: CachedScene,
    elements: CanvasElement[],
    matrix: Matrix2D,
    viewport: { width: number; height: number },
    devicePixelRatio: number
  ): boolean {
    if (
      scene.elements !== elements ||
      scene.viewportWidth !== viewport.width ||
      scene.viewportHeight !== viewport.height ||
      scene.devicePixelRatio !== devicePixelRatio
    ) {
      return false;
    }

    const scaleRatio = matrix.a / scene.anchorScale;
    if (scaleRatio < MIN_CACHE_SCALE_RATIO || scaleRatio > MAX_CACHE_SCALE_RATIO) return false;

    const left = devicePixelRatio * (matrix.e - scaleRatio * (scene.anchorX + CACHE_MARGIN));
    const top = devicePixelRatio * (matrix.f - scaleRatio * (scene.anchorY + CACHE_MARGIN));
    const width = scene.canvas.width / scene.cachePixelRatio * devicePixelRatio * scaleRatio;
    const height = scene.canvas.height / scene.cachePixelRatio * devicePixelRatio * scaleRatio;

    return (
      left <= 0 &&
      top <= 0 &&
      left + width >= viewport.width * devicePixelRatio &&
      top + height >= viewport.height * devicePixelRatio
    );
  }

  private createScene(
    elements: CanvasElement[],
    matrix: Matrix2D,
    viewport: { width: number; height: number },
    devicePixelRatio: number
  ): CachedScene {
    const canvas = document.createElement('canvas');
    const cacheWidth = viewport.width + CACHE_MARGIN * 2;
    const cacheHeight = viewport.height + CACHE_MARGIN * 2;
    const cachePixelRatio = Math.min(
      devicePixelRatio,
      MAX_CACHE_DIMENSION / cacheWidth,
      MAX_CACHE_DIMENSION / cacheHeight,
      Math.sqrt(MAX_CACHE_PIXELS / (cacheWidth * cacheHeight))
    );
    canvas.width = Math.ceil(cacheWidth * cachePixelRatio);
    canvas.height = Math.ceil(cacheHeight * cachePixelRatio);

    const context = canvas.getContext('2d');
    if (!context) throw new Error('Tidak bisa membuat cache kanvas');

    const cacheMatrix: Matrix2D = {
      ...matrix,
      e: matrix.e + CACHE_MARGIN,
      f: matrix.f + CACHE_MARGIN,
    };
    context.setTransform(
      cachePixelRatio * matrix.a,
      cachePixelRatio * matrix.b,
      cachePixelRatio * matrix.c,
      cachePixelRatio * matrix.d,
      cachePixelRatio * cacheMatrix.e,
      cachePixelRatio * cacheMatrix.f
    );

    const visibleElements = getVisibleElements(
      elements,
      { width: cacheWidth, height: cacheHeight },
      cacheMatrix
    );
    const roughCanvas: RoughCanvas = createRoughRenderer(canvas);
    for (const element of visibleElements) drawElement(roughCanvas, context, element);

    return {
      canvas,
      elements,
      anchorScale: matrix.a,
      anchorX: matrix.e,
      anchorY: matrix.f,
      viewportWidth: viewport.width,
      viewportHeight: viewport.height,
      devicePixelRatio,
      cachePixelRatio,
    };
  }
}
