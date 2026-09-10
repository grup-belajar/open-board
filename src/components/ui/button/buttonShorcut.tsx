import { redo, undo } from '@/src/store/slices/canvasSlice';
import { CircleAlert, CornerUpLeft, CornerUpRight } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'

export default function ButtonShorcut() {
    const dispacth = useDispatch();
    const canUndo = useSelector((state: any) => state.canvas.historyIndex > 0);
    const canRedo = useSelector((state: any) => state.canvas.historyIndex < state.canvas.history.length - 1);
    return (
        <div className="absolute flex flex-row gap-4 z-999 right-5 bottom-4">
            <div className="flex flex-row justify-between gap-4">
                <button onClick={() => dispacth(undo())} disabled={!canUndo} className='bg-white px-2 h-12 md:px-5 md:h-14 shadow-hard border-4 border-black cursor-pointer duration-200 delay-200 hover:shadow-none' title='Undo (CTRL + Z)'><CornerUpLeft /></button>
                <button onClick={() => dispacth(redo())} disabled={!canRedo} className='bg-white px-2 h-12 md:px-5 md:h-14 shadow-hard border-4 border-black cursor-pointer duration-200 delay-200 hover:shadow-none' title='Redo (CTRL + Y)'><CornerUpRight /></button>
            </div>
            <button className='bg-yellow-300 px-2 h-12 md:px-5 md:h-14 shadow-hard border-4 border-black cursor-pointer duration-200 delay-200 hover:shadow-none'><CircleAlert /></button>
        </div>
    )
}
