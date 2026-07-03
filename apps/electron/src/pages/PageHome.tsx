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
  const { deleteActiveTodo, toggleDone, toggleShowDone } = useTodoActions()
  const { setTodoOpen } = useUiActions()
  const { todoOpen, menuOpen, editMode, sidebarOpen } = useUiSelectors()

  const sorted = useMemo(() => {
    const filtered = filterDependsOnReady(
      filterOverdueOrUndated(filterNotInbox(filterDone(items, showDone))),
      items,
    )
    return defaultSort(filtered) as FeedItem[]
  }, [items, showDone])

  const hotkeysEnable = !todoOpen && !menuOpen && editMode === "normal" && !sidebarOpen
  const hotkeysDeps = [sorted, menuOpen, editMode, sidebarOpen, todoOpen]

  useHotkeys("KeyS", () => toggleShowDone(), hotkeysDeps, { enabled: hotkeysEnable })
  useHotkeys("KeyI", () => setTodoOpen("edit"), hotkeysDeps, { enabled: hotkeysEnable })
  useHotkeys("KeyO", () => setTodoOpen("add"), hotkeysDeps, { enabled: hotkeysEnable })
  useHotkeys("D", () => deleteActiveTodo(), hotkeysDeps, { enabled: hotkeysEnable })
  useHotkeys("d", () => { if (activeTodo) toggleDone(activeTodo.id) }, hotkeysDeps, { enabled: hotkeysEnable })

  useGlobalKeybindings()

  return (
    <div className="flex flex-col flex-1">
      <div className="flex-col overflow-y-auto">
        <div className="flex flex-1 flex-col px-2 py-2">
          <FeedList items={sorted} />
        </div>
      </div>
    </div>
  )
}
