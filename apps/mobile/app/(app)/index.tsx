import {
  filterDependsOnReady,
  filterDone,
  filterNotInbox,
  filterOverdueOrUndated,
} from "@repo/core"
import { router } from "expo-router"
import { useMemo } from "react"
import { TodoList } from "../../src/shared/ui/TodoList"
import { useTodoSelectors } from "../../src/store"

export default function HomeScreen() {
  const { todos, showDone } = useTodoSelectors()
  const sorted = useMemo(() => {
    const filtered = filterDependsOnReady(filterOverdueOrUndated(filterNotInbox(todos)), todos)
    return filterDone(filtered, showDone)
  }, [todos, showDone])

  return <TodoList items={sorted.filter((t) => !t.done)} onPress={(t) => router.push(`/todo/${t.id}`)} />
}
