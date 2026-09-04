import { Check, Download, X } from "lucide-react"
import { useState } from "react"

const ModelExport = () => {
    const [chekedOne, setCheckedOne] = useState<boolean>(false)
    const [chekedTwo, setCheckedTwo] = useState<boolean>(false)
    return (
            <div className="absolute top-[25%] md:top-[20%] lg:top-[10%] left-[30%] md:left-[20%] lg:left-[700%] w-72 md:w-150 md:h-165 lg:h-160 bg-white border-4 border-black z-999">
                <div className="flex flex-row justify-between items-center px-5 py-5 bg-accent-pink border-b-4 border-black">
                    <h2 className="text-40 font-body text-white font-semibold">Export & Simpan Papan</h2>
                    <button type="button" className="bg-white border-2 border-black cursor-pointer"><X /></button>
                </div>
                <div className="flex flex-col px-5 py-5 space-y-3.5 md:space-y-10 border-b-4 border-black">
                    <div className="flex flex-col space-y-3">
                        <h2 className="uppercase text-xl font-light text-gray-600">format export</h2>
                        <div className="flex flex-row justify-between space-x-4">
                            <button type="button" className="bg-accent-blue w-30 h-12 md:w-44 md:h-20 border-4 border-black font-bold text-white">PNG</button>
                            <button type="button" className="bg-white w-30 h-12 md:w-44 md:h-20 border-4 border-black font-black">SVG</button>
                            <button type="button" className="bg-white w-30 h-12 md:w-44 md:h-20 border-4 border-black font-black">JSON</button>
                        </div>
                    </div>
                    <div className="flex flex-col space-y-3">
                        <h2 className="uppercase text-base md:text-xl font-light text-gray-600">Opsi</h2>
                        <div className="flex flex-row gap-2" >
                            <ul className="space-y-3.5">
                                <label htmlFor="check-one" className="flex flex-row items-center space-x-2">
                                    <input type="checkbox" name="check-one" id="check-one" checked={chekedOne} onChange={(e) => setCheckedOne(e.target.checked)} className="relative w-7 h-7 appearance-none border-4 border-black cursor-pointer" />
                                    <Check className={`absolute left-6 ${chekedOne ? "opacity-100 bg-accent-blue text-white font-bold " : "opacity-0"}`} size={21} />
                                    <li className="font-display text-sm md:text-md font-bold text-gray-600">Latar Belakang Transparan</li>
                                </label>
                                <label htmlFor="check-two" className="flex flex-row items-center space-x-2">
                                    <input type="checkbox" name="check-two" id="check-two" checked={chekedTwo} onChange={(e) => setCheckedTwo(e.target.checked)} className="relative w-7 h-7 appearance-none border-4 border-black cursor-pointer" />
                                    <Check className={`absolute left-6 ${chekedTwo ? "opacity-100 bg-accent-blue text-white font-bold " : "opacity-0"}`} size={21} />
                                    <li className="font-display text-sm md:text-md font-bold text-gray-600">Sertakan Hanya Element Terpilih</li>
                                </label>
                            </ul>
                        </div>
                    </div>
                    <div className="flex flex-col space-y-3">
                        <h2 className="uppercase text-md font-light text-gray-600">Skala Gambar</h2>
                        <div className="flex flex-row justify-between space-x-4">
                            <button type="button" className="bg-accent-peach w-30 h-12 md:w-44 md:h-20 border-4 border-black font-bold text-black cursor-pointer">1x</button>
                            <button type="button" className="bg-white w-30 h-12 md:w-44 md:h-20 border-4 border-black font-bold text-black cursor-pointer">2x (HD)</button>
                            <button type="button" className="bg-white w-30 h-12 md:w-44 md:h-20 border-4 border-black font-bold text-black cursor-pointer">3x</button>
                        </div>
                    </div>
                </div>
                <div className="flex flex-row px-2 md:px-5 py-5 md:justify-end items-center">
                    <div className="flex flex-row space-x-2 md:space-x-5">
                        <button type="button" className="bg-white border-4 border-black w-32 h-16 rounded-md font-display">Batal</button>
                        <button type="button" className="flex flex-row gap-2 font-display items-center justify-center bg-accent-blue border-4 border-black w-32 md:w-40 h-16 rounded-md text-white"><Download className="hidden md:block" />Download</button>
                    </div>
                </div>
            </div>
    )
}

export default ModelExport