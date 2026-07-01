import { filterInbox } from "@repo/core"
import { router } from "expo-router"
import { useMemo, useState } from "react"
import { TodoList } from "../../src/shared/ui/TodoList"
import { syncFromServer } from "../../src/services/authService"
import { useTodoSelectors } from "../../src/store"

export default function InboxScreen() {
  const { todos } = useTodoSelectors()
  const [refreshing, setRefreshing] = useState(false)
  const items = useMemo(() => filterInbox(todos), [todos])

  async function handleRefresh() {
    setRefreshing(true)
    await syncFromServer()
    setRefreshing(false)
  }

  return (
    <TodoList items={items} onPress={(t) => router.push(`/todo/${t.id}`)} refreshing={refreshing} onRefresh={handleRefresh} />
  )
}
