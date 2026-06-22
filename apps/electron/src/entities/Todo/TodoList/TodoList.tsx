import type { Todo } from "@repo/core"
import { defaultSort, filterDone } from "@repo/core"
import { useEffect, useMemo, useRef } from "react"
import { useTodoSelectors } from "@/store/todosStore"
import TodoCard from "../TodoCard"
import { useTodoListKeybindings } from "./TodoList.keybind"

export default function TodoList({ items }: { items: Todo[] }) {
  const { activeTodo, showDone } = useTodoSelectors()
  const listRef = useRef<HTMLDivElement>(null)

  const todos: Todo[] = useMemo(() => defaultSort(filterDone(items, showDone)), [items, showDone])

  const activeIndex = useMemo(
    () => (activeTodo ? todos.findIndex((todo) => todo.id === activeTodo.id) : -1),
    [activeTodo, todos],
  )

  useEffect(() => {
    if (!activeTodo?.id) return
    const activeElement = listRef.current?.querySelector(`[data-id="${activeTodo.id}"]`)
    if (activeElement instanceof HTMLElement) {
      activeElement.scrollIntoView({ block: "center", behavior: "smooth" })
    }
  }, [activeTodo?.id, todos.length])

  useTodoListKeybindings(todos, activeIndex)

  return (
    <div ref={listRef} className="flex flex-1 flex-col gap-1 w-full overflow-auto">
      {defaultSort(todos).map((t, i) => (
        <TodoCard todo={t} isActive={i === activeIndex} key={t.id} />
      ))}
    </div>
  )
}
