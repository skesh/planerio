import { useMemo } from "react"
import useGlobalKeybindings from "@/app/global-keybindings"
import { useTodoSelectors } from "@/store/todosStore"
import TodoList from "../entities/Todo/TodoList/TodoList"

export default function PageInbox() {
  const { todos } = useTodoSelectors()

  const inboxTodos = useMemo(() => todos.filter((t) => t.projectId === "inbox"), [todos])

  useGlobalKeybindings()

  return <TodoList items={inboxTodos} />
}
