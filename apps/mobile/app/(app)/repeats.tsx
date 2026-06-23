import { filterRepeats } from "@repo/core"
import { useMemo } from "react"
import { TodoList } from "../../src/shared/ui/TodoList"
import { useTodoSelectors } from "../../src/store"

export default function RepeatsScreen() {
  const { todos } = useTodoSelectors()
  const items = useMemo(() => filterRepeats(todos), [todos])

  return <TodoList items={items} />
}
