"use client"
import { Minus, Plus } from "lucide-react"
import { useAppDispatch, useAppSelector } from "../../../store/hooks"
import { setPanZoom } from "../../../store/slices/canvasSlice"
import { getMatrixFromState, zoomAtPoint } from "../../../lib/matrixMath"

const ZOOM_STEP = 0.1

const ButtonZoom = () => {
  const dispatch = useAppDispatch()
  const panOffset = useAppSelector((state) => state.canvas.panOffset)
  const zoomLevel = useAppSelector((state) => state.canvas.zoomLevel)

  const zoomByStep = (delta: number) => {
    const canvas = document.querySelector<HTMLCanvasElement>('[data-testid="whiteboard-canvas"]')
    const rect = canvas?.getBoundingClientRect()
    const cx = rect ? rect.width / 2 : 0
    const cy = rect ? rect.height / 2 : 0
    const matrix = getMatrixFromState(panOffset, zoomLevel)
    const next = zoomAtPoint(matrix, 1 + delta, cx, cy)
    dispatch(setPanZoom({ panOffset: { x: next.e, y: next.f }, zoomLevel: next.a }))
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 hidden h-20 w-64 items-center justify-between border-4 border-primary bg-white shadow-hard md:left-10 md:flex">
      <button
        type="button"
        onClick={() => zoomByStep(-ZOOM_STEP)}
        className="h-full w-20 cursor-pointer border-r-4 border-primary bg-white px-6"
      >
        <Minus size={20} />
      </button>
      <span className="font-body font-semibold">{Math.round(zoomLevel * 100)}%</span>
      <button
        type="button"
        onClick={() => zoomByStep(ZOOM_STEP)}
        className="h-full w-20 cursor-pointer border-l-4 border-primary bg-white px-6"
      >
        <Plus size={16} />
      </button>
    </div>
  )
}

export default ButtonZoom
