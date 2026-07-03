import {
  filterDependsOnReady,
  filterNotInbox,
  filterOverdueOrUndated,
} from "@repo/core"
import { router } from "expo-router"
import { useMemo, useState } from "react"
import { TodoList } from "../../src/shared/ui/TodoList"
import { syncFromServer } from "../../src/services/authService"
import { useTodoSelectors } from "../../src/store"

export default function HomeScreen() {
  const { todos } = useTodoSelectors()
  const [showDone, setShowDone] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const sorted = useMemo(() => {
    const filtered = filterDependsOnReady(filterOverdueOrUndated(filterNotInbox(todos)), todos)
    return showDone ? filtered : filtered.filter((t) => !t.done)
  }, [todos, showDone])

  async function handleRefresh() {
    setRefreshing(true)
    await syncFromServer()
    setRefreshing(false)
  }

  return (
    <TodoList
      items={sorted.filter((t) => !t.done)}
      onPress={(t) => router.push(`/todo/${t.id}`)}
      refreshing={refreshing}
      onRefresh={handleRefresh}
    />
  )
}
