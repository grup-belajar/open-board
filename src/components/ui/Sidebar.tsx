'use client'
import { useState } from "react"
import { Eraser, Hand, MousePointer, NotebookPen, Pencil, Circle, Minus, Square } from "lucide-react"
import PropertyColors from "../properties/ProperyColors"
import { useAppDispatch, useAppSelector } from "../../store/hooks"
import { setActiveTool, type ToolType } from "../../store/slices/toolSlice"

const TOOLS: { label: string; icon: typeof MousePointer; tool: ToolType }[] = [
    { label: "Select", icon: MousePointer, tool: "select" },
    { label: "Pan", icon: Hand, tool: "pan" },
    { label: "Pen", icon: Pencil, tool: "pen" },
    { label: "Rectangle", icon: Square, tool: "rectangle" },
    { label: "Ellipse", icon: Circle, tool: "ellipse" },
    { label: "Line", icon: Minus, tool: "line" },
    { label: "Text", icon: Pencil, tool: "text" },
    { label: "Notes", icon: NotebookPen, tool: "sticky" },
    { label: "Eraser", icon: Eraser, tool: "eraser" },
]

export default function Sidebar() {
    const [propertiColor, setPropertiColors] = useState(false)
    const activeTool = useAppSelector((state) => state.tool.activeTool)
    const dispatch = useAppDispatch()

    const handleClick = (tool: ToolType) => {
        dispatch(setActiveTool(tool))
        setPropertiColors(tool === "text" || tool === "sticky")
    }

    return (
        <div className="fixed left-2 top-1/2 z-50 flex w-16 -translate-y-1/2 flex-col items-center border-2 border-primary bg-surface p-1.5 shadow-hard md:left-10">
            <span className="text-sm font-bold">TOOLS</span>
            <hr className="h-px w-12 bg-primary" />
            <ul className="flex max-h-[70vh] flex-col items-center justify-center space-y-1.5 overflow-y-auto pt-2">
                {TOOLS.map(({ label, icon: Icon, tool }) => (
                    <li key={tool}>
                        <button
                            type="button"
                            title={label}
                            className={`flex w-12 flex-col items-center space-y-0.5 rounded-md border-2 px-1.5 py-2 transition-colors ${activeTool === tool ? "border-primary bg-accent-blue text-white" : "border-transparent bg-white"}`}
                            onClick={() => handleClick(tool)}
                        >
                            <Icon className="size-5" />
                            <span className="font-display text-[10px]">{label}</span>
                        </button>
                    </li>
                ))}
            </ul>
            {propertiColor && <PropertyColors />}
        </div>
    )
}
