"use client"
import { Minus, Plus } from "lucide-react"
interface TypeButtonZoom {
    zoom : number
    handleZoom : () => void,
    handleOutZoom : () => void
}
const ButtonZoom = (props : TypeButtonZoom) => {
    const { zoom, handleZoom ,handleOutZoom} = props
    return (
        <div className="hidden md:flex flex-row fixed bottom-4 left-4 md:left-10 bg-white border-4 border-black z-99 w-64 h-20 items-center justify-between shadow-hard ">
            <button type="button" onClick={handleOutZoom} className="bg-white w-20 h-full border-r-4 border-black px-6 cursor-pointer">
                <Minus size={20} />
            </button>
            <span className="font-body font-semibold">{zoom ?? "100"}%</span>
            <button type="button" className="bg-white w-20 h-full border-l-4 border-black  px-6 cursor-pointer" onClick={handleZoom}><Plus size={16} /></button>
        </div>
    )
}

export default ButtonZoom