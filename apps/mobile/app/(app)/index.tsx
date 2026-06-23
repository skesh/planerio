import { filterDone, filterDependsOnReady, filterNotInbox, filterOverdueOrUndated } from "@repo/core"
import { useMemo } from "react"
import { TodoList } from "../../src/shared/ui/TodoList"
import { useTodoSelectors } from "../../src/store"

export default function HomeScreen() {
  const { todos, showDone } = useTodoSelectors()
  const sorted = useMemo(() => {
    const filtered = filterDependsOnReady(filterOverdueOrUndated(filterNotInbox(todos)), todos)
    return filterDone(filtered, showDone)
  }, [todos, showDone])

  return <TodoList items={sorted.filter((t) => !t.done)} />
}
