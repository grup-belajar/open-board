import { CircleAlert, CornerUpLeft, CornerUpRight } from 'lucide-react'

export default function ButtonShorcut() {
    return (
        <div className="flex flex-row fixed gap-4 z-999 right-5 bottom-4">
            <div className="flex flex-row justify-between gap-4">
                <button className='bg-white px-5 h-14 shadow-hard border-4 border-black cursor-pointer duration-200 delay-200 hover:shadow-none'><CornerUpLeft /></button>
                <button className='bg-white px-5 h-14 shadow-hard border-4 border-black cursor-pointer duration-200 delay-200 hover:shadow-none'><CornerUpRight /></button>
            </div>
            <button className='bg-yellow-300 px-5 h-14 shadow-hard border-4 border-black cursor-pointer duration-200 delay-200 hover:shadow-none'><CircleAlert /></button>
        </div>
    )
}
