import { filterInbox } from "@repo/core"
import { router } from "expo-router"
import { useMemo } from "react"
import { TodoList } from "../../src/shared/ui/TodoList"
import { useTodoSelectors } from "../../src/store"

export default function InboxScreen() {
  const { todos } = useTodoSelectors()
  const items = useMemo(() => filterInbox(todos), [todos])

  return <TodoList items={items} onPress={(t) => router.push(`/todo/${t.id}`)} />
}
