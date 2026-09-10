'use client'

import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { setStrokeColor, setStrokeWidth } from "@/src/store/slices/toolSlice";
import { useState } from "react";

interface PropertyState {
    color: string | null;
    strokeWidth: number;
    style: "sketch" | "solid"
}
export default function PropertyColors() {
    const dispacth = useAppDispatch();
    const strokeColors = useAppSelector((state) => state.tool.strokeColor);
    const storokeWidth = useAppSelector((state) => state.tool.strokeWidth);
    const [properties, setPropeties] = useState<PropertyState>({
        color: null,
        strokeWidth: 1,
        style: "sketch"
    })

    // Map color names to hex values
    const colorMap: Record<string, string> = {
        black: "#000000",
        "accent-blue": "#3b82f6",
        "accent-red": "#ef4444",
        "accent-yellow": "#facc15",
        "accent-green": "#22c55e",
        "accent-peach": "#ffb366",
        white: "#ffffff",
        "gray-600": "#4b5563"
    };

    const colors = [
        { name: "black", class: "bg-black" },
        { name: "accent-blue", class: "bg-accent-blue" },
        { name: "accent-red", class: "bg-accent-red" },
        { name: "accent-yellow", class: "bg-accent-yellow" },
        { name: "accent-green", class: "bg-accent-green" },
        { name: "accent-peach", class: "bg-accent-peach" },
        { name: "white", class: "bg-white" },
        { name: "gray-600", class: "bg-gray-600" }
    ]


    const storke = [1, 1.5, 2];
    const hanldeColorSelect = (colorName: string) => {
        const hexColors = colorMap[colorName];
        dispacth(setStrokeColor(hexColors))
    }


    const handleStorokeChange = (width: number) => {
        dispacth(setStrokeWidth(width))
    }

    const handleStyleChange = (style: "sketch" | "solid") => {
        setPropeties(prev => ({ ...prev, style }))
    }
    return (
        <div className="absolute left-full top-1/2 ml-3 -translate-y-1/2 z-50 bg-white border-4 border-primary w-52 shadow-hard-lg">
            <div className="flex flex-col px-2 py-4 space-y-2">
                <h2 className="font-body text-md">Color</h2>
                <div className="grid grid-cols-4 py-2 px-1 space-y-2">
                    {colors.map((color) => (
                        <button key={color.name} onClick={() => hanldeColorSelect(color.name)}
                            className={`${color.class} w-5 h-5 border-2 cursor-pointer transition-all ${strokeColors === color.name ? "border-black scale-110 shadow-md" : "border-black opacity-60 hover:opacity-100"}`}
                            title={color.name} />
                    ))}
                </div>
                <h2 className="font-body text-md">Stroke</h2>
                <div className="flex flex-col space-y-4">
                    {storke.map((width) => (
                        <button key={width} onClick={() => handleStorokeChange(width)}
                            className={`border-2 border-black transition-all ${storokeWidth === width ? "bg-accent-blue" : "bg-white    hover:bg-gray-100"}`}
                            style={{ height: `${width * 8}px` }}
                            title={`Storke ${width}px`} />
                    ))}
                </div>
                <h2 className="font-body text-md">Style</h2>
                <div className="flex flex-row border-2 border-black">
                    <button onClick={() => handleStyleChange("sketch")} type="button" className={`flex px-3 py-2 w-52 text-xs font-bold transition-colors ${properties.style === "sketch" ? "bg-accent-blue text-white" : "bg-white text-black"} cursor-pointer`}>SKETCH</button>
                    <button onClick={() => handleStyleChange("solid")} type="button" className={`flex px-3 w-52 py-2 text-xs font-bold transition-colors ${properties.style === "solid" ? "bg-accent-blue text-white" : "bg-white text-black"} cursor-pointer   `}>SOLID</button>
                </div>
            </div>
        </div>
    )
}
