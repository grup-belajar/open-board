import { Hand, LayoutTemplate, LucideIcon, NotebookPen, Pencil, Save, Send } from "lucide-react"


export type TypeConfigSidebar = {
    id: number,
    icon: LucideIcon,
    text: string
}

export const configSidebarTools: TypeConfigSidebar[] = [
    {
        id: 0,
        icon: Send,
        text: "Select"
    },
    {
        id: 1,
        icon: Hand,
        text: "Pan"
    },
    {
        id: 2,
        icon: LayoutTemplate,
        text: "Shapes"
    },
    {
        id: 3,
        icon: Pencil,
        text: "Text"
    },
    {
        id: 4,
        icon: NotebookPen,
        text: "Notes"
    },
    {
        id: 5,
        icon: Save,
        text: "Save"
    }
]