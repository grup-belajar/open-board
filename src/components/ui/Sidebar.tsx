'use client'
import { useState } from "react"
import { configSidebarTools } from "../config/configSibarTools"
import PropertyColors from "../properties/ProperyColors"
import { useAppDispatch, useAppSelector } from "../../store/hooks"
import { setActiveTool, type ToolType } from "../../store/slices/toolSlice"

export default function Sidebar() {
    const [propertiColor, setPropertiColors] = useState<boolean>(false);
    const [showShapes, setShowShapes] = useState<boolean>(false);
    const activeTool = useAppSelector((state) => state.tool.activeTool);
    const dispatch = useAppDispatch();

    const handleClick = (tool: ToolType) => {
        dispatch(setActiveTool(tool));
        setPropertiColors(tool === "text" || tool === "sticky");
        setShowShapes(false);
    }

    return (
        <div className="fixed left-2 top-1/2 z-50 flex w-14 -translate-y-1/2 flex-col items-center border-2 border-primary bg-surface p-1 shadow-hard md:left-10">
            <span className="text-xs font-bold">TOOLS</span>
            <hr className="h-px w-10 bg-primary" />
            <ul className="flex flex-col items-center justify-center space-y-0.5 cursor-pointer pt-1">
                {configSidebarTools.map((item) => (
                    <li key={item.id}>
                        <button
                            type="button"
                            title={item.text}
                            className={`flex w-10 flex-col items-center rounded-md border-2 px-1 py-1 transition-colors ${(item.subTools ? ['rectangle', 'ellipse', 'line'].includes(activeTool) : activeTool === item.tool) ? "border-primary bg-accent-blue text-white" : "border-transparent bg-white"}`}
                            onClick={() => {
                                if (item.subTools) {
                                    setShowShapes(prev => !prev);
                                    setPropertiColors(false);
                                } else {
                                    handleClick(item.tool);
                                }
                            }}
                        >
                            <item.icon className="size-4" />
                            <span className="font-display text-[10px]">{item.text}</span>
                        </button>
                    </li>
                ))}
            </ul>

            {showShapes && (
                <div className="absolute left-full top-1/2 ml-3 -translate-y-1/2 z-50 bg-white border-2 border-primary shadow-hard">
                    <ul className="flex flex-col">
                        {configSidebarTools.find((item) => item.subTools)?.subTools!.map((sub) => (
                            <li key={sub.tool}>
                                <button
                                    type="button"
                                    className={`w-24 px-3 py-2 text-left font-body text-sm transition-colors ${activeTool === sub.tool ? "bg-accent-blue text-white" : "hover:bg-accent-blue hover:text-white"}`}
                                    onClick={() => handleClick(sub.tool)}
                                >
                                    {sub.text}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {propertiColor && (
                <PropertyColors />
            )}
            {save && (
                <ModelExport />
            )}
        </div>
    )
}
