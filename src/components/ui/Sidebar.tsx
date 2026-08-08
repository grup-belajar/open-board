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
        <div className="fixed left-2 top-1/2 z-50 flex w-20 -translate-y-1/2 flex-col items-center border-4 border-primary bg-surface p-2 shadow-hard md:left-10">
            <span className="font-bold text-xl md:text-sm">TOOLS</span>
            <hr className="h-1 w-16 bg-primary" />
            <ul className={`flex flex-col justify-center items-center space-y-3 cursor-pointer pt-2`}>
                {configSidebarTools.map((item, id) => (
                    <li key={item.id}>
                        <button type="button" className={`px-2 py-3 flex flex-col items-center rounded-md space-y-1 md:w-16 transition-colors ${active === id ? "bg-accent-blue text-white w-16 border-2 px-4 border-primary" : "bg-white"}`} onClick={(event) => handleClick(event, item.id)}>
                            <item.icon className="size-6" />
                            <span className="font-display text-sm">{item.text}</span>
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
