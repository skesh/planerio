import { filterInbox } from "@repo/core"
import { useMemo } from "react"
import useGlobalKeybindings from "@/app/global-keybindings"
import { useTodoSelectors } from "@/store/todosStore"
import TodoList from "../entities/Todo/TodoList/TodoList"

export default function PageInbox() {
  const { todos } = useTodoSelectors()

  const inboxTodos = useMemo(() => filterInbox(todos), [todos])

  useGlobalKeybindings()

  return <TodoList items={inboxTodos} />
}
