import { filterDependsOnReady, filterNotInbox, filterOverdueOrUndated } from "@repo/core"
import { useMemo } from "react"
import useGlobalKeybindings from "@/app/global-keybindings"
import { useTodoSelectors } from "@/store/todosStore"
import TodoList from "../entities/Todo/TodoList/TodoList"

export default function PageHome() {
  const { todos } = useTodoSelectors()
  const homeTodos = useMemo(
    () => filterDependsOnReady(filterOverdueOrUndated(filterNotInbox(todos)), todos),
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
