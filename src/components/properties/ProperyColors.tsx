'use client'

export default function PropertyColors() {
    return (
        <div className="bg-white absolute top-50 left-32 md:left-28 border-4 border-black w-52 z-999 shadow-hard-lg">
            <div className="flex flex-col px-2 py-4 space-y-2">
                <h2 className="font-body text-md">Color</h2>
                <div className="grid grid-cols-4 py-2 px-1 space-y-2">
                    <label className="bg-black w-5 h-5 px-0.5 border-2 border-black cursor-pointer">
                        <input type="checkbox" className="hidden" />
                    </label>
                    <label className="bg-accent-blue w-5 h-5 px-0.5 border-2 border-black cursor-pointer">
                        <input type="checkbox" className="hidden" />
                    </label>
                    <label className="bg-accent-red w-5 h-5 px-0.5 border-2 border-black cursor-pointer">
                        <input type="checkbox" className="hidden" />
                    </label>
                    <label className="bg-accent-yellow w-5 h-5 px-0.5 border-2 border-black cursor-pointer">
                        <input type="checkbox" className="hidden" />
                    </label>
                    <label className="bg-accent-green w-5 h-5 px-0.5 border-2 border-black cursor-pointer">
                        <input type="checkbox" className="hidden" />
                    </label>
                    <label className="bg-accent-peach w-5 h-5 px-0.5 border-2 border-black cursor-pointer">
                        <input type="checkbox" className="hidden" />
                    </label>
                    <label className="bg-white w-5 h-5 px-0.5 border-2 border-black cursor-pointer">
                        <input type="checkbox" className="hidden" />
                    </label>
                    <label className="bg-gray-600 w-5 h-5 px-0.5 border-2 border-black cursor-pointer">
                        <input type="checkbox" className="hidden" />
                    </label>
                </div>
                <h2 className="font-body text-md">Stroke</h2>
                <div className="flex flex-col space-y-4">
                    <hr />
                    <hr className="h-1.5 bg-black" />
                    <hr className="h-2 bg-black" />
                </div>
                <h2 className="font-body text-md">Style</h2>
                <div className="flex flex-row border-2 border-black bg-blue-200">
                    <button type="button" className="bg-blue-500 text-black w-56">SKETCH</button>
                    <button type="button" className="bg-white text-black w-56">SKETCH</button>
                </div>
            </div>
        </div>
    )
}