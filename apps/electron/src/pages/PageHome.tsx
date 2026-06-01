import { isAfter, parse } from "date-fns"
import { useMemo } from "react"
import { DATE_FORMAT } from "@repo/core"
import useGlobalKeybindings from "@/app/global-keybindings"
import { useTodoSelectors } from "@/store/todosStore"
import TodoList from "../entities/Todo/TodoList/TodoList"

export default function PageHome() {
  const { todos } = useTodoSelectors()
  const homeTodos = useMemo(
    () =>
      todos
        .filter((p) => p.projectId !== "inbox")
        .filter((t) => (t.date ? isAfter(new Date(), parse(t.date, DATE_FORMAT, new Date())) : t))
        .filter((t) => t.dependsOn.every((depId) => todos.find((t) => t.id === depId)?.done)),
    [todos],
  )

  useGlobalKeybindings()

  return (
    <div className="flex flex-col flex-1">
      <div className="flex-col overflow-y-auto">
        <div className="flex flex-1 flex-col px-2 py-2">
          <TodoList items={homeTodos} />
        </div>
      </div>
    </div>
  )
}
