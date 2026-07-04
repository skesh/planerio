import { useEffect } from "react"
import { cn } from "@/shared/lib/utils"
import { useTodoSelectors } from "@/store/todosStore"
import { useUiSelectors } from "@/store/uiStore"
import { useRunnerStore, useAuthSelectors } from "@repo/core"

export default function Footer() {
  const { todos, activeTodo } = useTodoSelectors()
  const { editMode } = useUiSelectors()
  const { activeAccountId } = useAuthSelectors()
  const { runners, isUpdating } = useRunnerStore()

  useEffect(() => {
    useRunnerStore.getState().loadRunners()
  }, [activeAccountId])

  const runner = runners.find((r) => r.type === "hh-rss")

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
      <div className="flex ml-auto gap-4">
        {runner && (
          <span className="text-xs text-muted-foreground">
            hh: {runner.status}
            {isUpdating && " *"}
            , last: {runner.lastRunAt ? new Date(runner.lastRunAt).toLocaleTimeString() : "—"}
          </span>
        )}
        {activeTodo && <span>Active ID: {activeTodo?.id}</span>}
        <span>Total: {todos.length}</span>
      </div>
    </div>
  )
}
