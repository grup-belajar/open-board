import { Hand, LayoutTemplate, LucideIcon,  NotebookPen,  Pencil, Send } from "lucide-react"
import type { ToolType } from "../../store/slices/toolSlice"


export type TypeConfigSidebar = {
    id: number,
    icon: LucideIcon,
    text: string,
    tool: ToolType
}

export const configSidebarTools: TypeConfigSidebar[] = [
    {
        id: 0,
        icon: Send,
        text: "Select",
        tool: 'select'
    },
    {
        id: 1,
        icon: Hand,
        text: "Pan",
        tool: 'pan'
    },
    {
        id: 2,
        icon: LayoutTemplate,
        text: "Shapes",
        tool: 'rectangle'
    },
    {
        id: 3,
        icon: Pencil,
        text: "Text",
        tool: 'text'
    },
    {
        id: 4,
        icon: NotebookPen,
        text: "Notes",
        tool: 'sticky'
    }
]