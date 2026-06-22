import { filterDependsOnReady, filterNotInbox, filterOverdueOrUndated } from "@repo/core"
import { useMemo } from "react"
import { TodoList } from "../../src/shared/ui/TodoList"
import { useTodoSelectors } from "../../src/store"

export default function HomeScreen() {
  const { todos } = useTodoSelectors()
  const sorted = useMemo(
    () => filterDependsOnReady(filterOverdueOrUndated(filterNotInbox(todos)), todos),
    [todos],
  )

  return <TodoList items={sorted} />
}
