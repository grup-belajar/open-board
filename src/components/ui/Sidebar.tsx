'use client'
import { MouseEvent, useState } from "react"
import { configSidebarTools } from "../config/configSibarTools"
import PropertyColors from "../properties/ProperyColors"
import ModelExport from "./modal/ModelExport";

type TypeSidebar = {
    setBlur: (value: boolean) => void
}
function SudidebrColors(props: TypeSidebar) {
    const [propertiColor, setPropertiColors] = useState<boolean>(false);
    const [save, setSave] = useState<boolean>(false);
    const [active, setActive] = useState<number>(0)
    const { setBlur } = props
    const handleClick = (event: MouseEvent<HTMLButtonElement>, id: number) => {
        setActive(id)
        setBlur(false)
        if (id === 3) {
            setPropertiColors(prev => !prev)
            setSave(false)
            return
        }
        if (id === 5) {
            setSave(prev => !prev)
            setPropertiColors(false)
            setBlur(true)
            return
        }
        setPropertiColors(false)
        setSave(false)
    }
    return (
        <div className="bg-white fixed left-5 md:left-10 top-5 md:top-5 flex flex-col z-999 px-10 w-24 h-184 justify-center items-center rounded-md border-4 border-black space-y-2.5 shadow-hard">
            <span className="text-xl md:text-sm font-bold">TOOLS</span>
            <hr className="h-1 w-20 bg-black" />
            <ul className={`flex flex-col justify-center items-center space-y-6  cursor-pointer`}>
                {configSidebarTools.map((item, id) => (
                    <li key={item.id}>
                        <button type="button" className={`px-2 py-4 flex flex-col items-center rounded-md space-y-2 md:w-16 transition-colors ${active === id ? "bg-accent-blue text-white w-16 border-2 px-4 border-black" : "bg-white"}`} onClick={(event) => handleClick(event, item.id)}>
                            <item.icon className="size-6" />
                            <span className="font-display text-dark text-md">{item.text}</span>
                        </button>
                    </li>
                ))}
            </ul>

            {propertiColor && (
                <PropertyColors />
            )}
            {save && (
                <ModelExport />
            )}
        </div>
    )
}

export default SudidebrColors
