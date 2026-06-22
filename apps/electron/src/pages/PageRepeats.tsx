import { filterRepeats } from "@repo/core"
import { useMemo } from "react"
import useGlobalKeybindings from "@/app/global-keybindings"
import { useTodoSelectors } from "@/store/todosStore"
import TodoList from "../entities/Todo/TodoList/TodoList"

export default function PageRepeats() {
  const { todos } = useTodoSelectors()

  const repeatsTodos = useMemo(() => filterRepeats(todos), [todos])

  useGlobalKeybindings()

  return <TodoList items={repeatsTodos} />
}
