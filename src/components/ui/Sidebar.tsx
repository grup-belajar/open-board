'use client'
import { MouseEvent, useState } from "react"
import { configSidebarTools } from "../config/configSibarTools"
import PropertyColors from "../properties/ProperyColors"

function SudidebrColors() {
    const [propertiColor, setPropertiColors] = useState<boolean>(false);
    const [active, seActive] = useState<number>(0)
    const handleClick = (event: MouseEvent<HTMLButtonElement>, id: number) => {
        if (id === 3) {
            setPropertiColors(prev => !prev)
        }
        else
            setPropertiColors(false)
        seActive(id)
    }
    return (
        <div className="fixed left-2 top-1/2 z-50 flex w-16 -translate-y-1/2 flex-col items-center border-2 border-primary bg-surface p-1.5 shadow-hard md:left-10">
            <span className="text-sm font-bold">TOOLS</span>
            <hr className="h-px w-12 bg-primary" />
            <ul className={`flex flex-col justify-center items-center space-y-1.5 cursor-pointer pt-2`}>
                {configSidebarTools.map((item, id) => (
                    <li key={item.id}>
                        <button type="button" className={`px-1.5 py-2 flex flex-col items-center rounded-md space-y-0.5 md:w-12 transition-colors ${active === id ? "bg-accent-blue text-white w-12 border-2 px-2 border-primary" : "bg-white border-2 border-transparent"}`} onClick={(event) => handleClick(event, item.id)}>
                            <item.icon className="size-5" />
                            <span className="font-display text-[10px]">{item.text}</span>
                        </button>
                    </li>
                ))}
            </ul>

            {propertiColor && (
                <PropertyColors />
            )}
        </div>
    )
}

export default SudidebrColors
