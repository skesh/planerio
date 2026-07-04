import { useRunnerStore, useAuthSelectors } from "@repo/core"
import { useLocation } from "react-router"
import { cn } from "@/shared/lib/utils"
import { useTodoSelectors } from "@/store/todosStore"
import { useUiSelectors } from "@/store/uiStore"
import { useEffect } from "react"

export default function Footer() {
  const { todos, activeTodo } = useTodoSelectors()
  const { editMode } = useUiSelectors()
  const { runners, isUpdating } = useRunnerStore()
  const { activeAccountId } = useAuthSelectors()
  const location = useLocation()

  const runner = runners.find((r) => r.type === "hh-rss")

  useEffect(() => {
    useRunnerStore.getState().loadRunners()
  }, [activeAccountId])

  return (
    <div className="sticky bottom-0 flex w-full shrink-0 gap-2 bg-background items-center">
      <div
        className={cn(
          editMode !== "edit" && "bg-green-500 px-2",
          editMode === "edit" && "bg-blue-500 px-2",
        )}
      >
        {editMode.toUpperCase()}
      </div>
      {location.pathname === "/vacancy" && runner && (
        <span className="text-xs text-muted-foreground">
          hh: {runner.status}
          {isUpdating && " *"}, last:{" "}
          {runner.lastRunAt ? new Date(runner.lastRunAt).toLocaleTimeString() : "—"}
        </span>
      )}
      <div className="flex ml-auto gap-4">
        {activeTodo && <span>Active ID: {activeTodo?.id}</span>}
        <span>Total: {todos.length}</span>
      </div>
    </div>
  )
}
