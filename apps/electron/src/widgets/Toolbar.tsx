import { EyeIcon } from "lucide-react"
import { SidebarTrigger } from "@/shared/ui/sidebar.tsx"
import { Toggle } from "@/shared/ui/toggle.tsx"
import { useTodoStore } from "@/store/todosStore"
import { useUIStore } from "@/store/uiStore.ts"

export default function Toolbar() {
  const isFiltred = useTodoStore((s) => s.isFiltred)
  const toogleFilter = useTodoStore((s) => s.toggleFilter)
  const toogleSidebar = useUIStore((s) => s.toggleSidebar)

  return (
    <div className="flex items-center gap-4 justify-between px-2 py-2 shrink-0">
      <SidebarTrigger onClick={() => toogleSidebar()} />

      <Toggle onClick={toogleFilter} pressed={isFiltred} className="gap-2">
        <EyeIcon className="group-data-[state=on]/toggle:fill-foreground" />
        {isFiltred ? "hidden" : "show"}
      </Toggle>

      {/* <div className="flex gap-2 items-center"> */}
      {/*   <span>Tags: </span> */}
      {/*   {[...tags].map((tag, index) => ( */}
      {/*     <Badge variant="secondary" key={index}>{tag}</Badge> */}
      {/*   ))} */}
      {/* </div> */}
    </div>
  )
}
