import { compareAsc, parse } from "date-fns"
import { useEffect, useMemo, useRef } from "react"
import { DATE_FORMAT } from "@/app/config"
import type { Todo } from "@/shared/model/todo"
import { useTodoSelectors } from "@/store/todosStore"
import TodoCard from "../TodoCard"
import { useTodoListKeybindings } from "./TodoList.keybind"

export default function TodoList({ items }: { items: Todo[] }) {
  const { activeTodo, showDone } = useTodoSelectors()
  const listRef = useRef<HTMLDivElement>(null)

  const todos: Todo[] = useMemo(() => {
    const inprocess: Todo[] = showDone ? items : items.filter((i) => !i.done)
    return defaultSort(inprocess)
  }, [items, showDone])

  const activeIndex = useMemo(
    () => (activeTodo ? todos.findIndex((todo) => todo.id === activeTodo.id) : -1),
    [activeTodo, todos],
  )

  function defaultSort(items: Todo[]) {
    return items
      .sort((a, b) => {
        if (!a.date && !b.date) return 0
        if (!a.date) return 1
        if (!b.date) return -1
        return compareAsc(
          parse(a.date, DATE_FORMAT, new Date()),
          parse(b.date, DATE_FORMAT, new Date()),
        )
      })
      .sort((a, b) => Number(b.priority) - Number(a.priority))
  }

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
