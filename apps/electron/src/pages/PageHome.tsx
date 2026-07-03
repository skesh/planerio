import type { FeedItem } from "@repo/core"
import { defaultSort, filterDependsOnReady, filterDone, filterNotInbox, filterOverdueOrUndated } from "@repo/core"
import { useMemo } from "react"
import useGlobalKeybindings from "@/app/global-keybindings"
import { useHotkeys } from "@/shared/hooks/useHotkeys"
import { useTodoActions, useTodoFeedItems, useTodoSelectors } from "@/store/todosStore"
import { useUiActions, useUiSelectors } from "@/store/uiStore"
import FeedList from "@/shared/ui/FeedList"

export default function PageHome() {
  const items = useTodoFeedItems()
  const { activeTodo, showDone } = useTodoSelectors()
  const { setActiveId, deleteActiveTodo, toggleDone, toggleShowDone } = useTodoActions()
  const { setTodoOpen } = useUiActions()
  const { todoOpen, menuOpen, editMode, sidebarOpen } = useUiSelectors()

  const filtered = useMemo(
    () => filterDependsOnReady(filterOverdueOrUndated(filterNotInbox(filterDone(items, showDone))), items),
    [items, showDone],
  )
  const sorted = useMemo(() => defaultSort(filtered) as FeedItem[], [filtered])

  const activeIndex = useMemo(
    () => (activeTodo ? sorted.findIndex((i) => i.id === activeTodo.id) : 0),
    [activeTodo, sorted],
  )

  const hotkeysEnable = !todoOpen && !menuOpen && editMode === "normal" && !sidebarOpen
  const hotkeysDeps = [sorted, menuOpen, editMode, sidebarOpen, todoOpen]

  useHotkeys("KeyJ", () => {
    const next = activeIndex < sorted.length - 1 ? activeIndex + 1 : 0
    sorted[next] && setActiveId(sorted[next].id)
  }, [activeIndex, sorted, setActiveId, ...hotkeysDeps], { enabled: hotkeysEnable })

  useHotkeys("KeyK", () => {
    const next = activeIndex > 0 ? activeIndex - 1 : sorted.length - 1
    sorted[next] && setActiveId(sorted[next].id)
  }, [activeIndex, sorted, setActiveId, ...hotkeysDeps], { enabled: hotkeysEnable })

  useHotkeys("Enter", () => {
    if (activeTodo) setTodoOpen("edit")
  }, [activeTodo, setTodoOpen, ...hotkeysDeps], { enabled: hotkeysEnable })

  useHotkeys("KeyS", () => toggleShowDone(), hotkeysDeps, { enabled: hotkeysEnable })
  useHotkeys("KeyI", () => setTodoOpen("edit"), hotkeysDeps, { enabled: hotkeysEnable })
  useHotkeys("KeyO", () => setTodoOpen("add"), hotkeysDeps, { enabled: hotkeysEnable })
  useHotkeys("G", () => sorted[0] && setActiveId(sorted[0].id), hotkeysDeps, { enabled: hotkeysEnable })
  useHotkeys("D", () => { deleteActiveTodo() }, hotkeysDeps, { enabled: hotkeysEnable })
  useHotkeys("d", () => { if (activeTodo) toggleDone(activeTodo.id) }, hotkeysDeps, { enabled: hotkeysEnable })

  useGlobalKeybindings()

  return (
    <div className="flex flex-col flex-1">
      <div className="flex-col overflow-y-auto">
        <div className="flex flex-1 flex-col px-2 py-2">
          <FeedList items={sorted} activeId={activeTodo?.id} />
        </div>
      </div>
    </div>
  )
}
