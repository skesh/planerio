import type { FeedItem } from "@repo/core"
import { useEffect, useRef, useState } from "react"
import TodoCard from "@/entities/Todo/TodoCard"
import TodoDrawer from "@/entities/Todo/TodoDrawer"
import { useTodoActions } from "@/store/todosStore"
import { useUiActions, useUiSelectors } from "@/store/uiStore"
import { useHotkeys } from "../hooks/useHotkeys"
import { VacancyCard } from "./VacancyCard"

interface FeedListProps {
  items: FeedItem[]
}

export default function FeedList({ items }: FeedListProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)
  const { setActiveId } = useTodoActions()
  const { setTodoOpen } = useUiActions()
  const { todoOpen } = useUiSelectors()

  const clamp = (i: number) => {
    if (items.length === 0) return 0
    return Math.min(Math.max(i, 0), items.length - 1)
  }

  const handleOpen = (item: FeedItem) => {
    if (item.kind === "todo") {
      setTodoOpen("edit")
    } else {
      window.open(item.url, "_blank")
    }
  }

  useHotkeys("KeyJ", () => {
    const next = activeIndex < items.length - 1 ? activeIndex + 1 : 0
    const item = items[next]
    if (!item) return
    setActiveIndex(next)
    if (item.kind === "todo") setActiveId(item.id)
  }, [activeIndex, items, setActiveId])

  useHotkeys("KeyK", () => {
    const next = activeIndex > 0 ? activeIndex - 1 : items.length - 1
    const item = items[next]
    if (!item) return
    setActiveIndex(next)
    if (item.kind === "todo") setActiveId(item.id)
  }, [activeIndex, items, setActiveId])

  useHotkeys("Enter", () => {
    const item = items[activeIndex]
    if (item) handleOpen(item)
  }, [activeIndex, items])

  useHotkeys("Escape", () => setTodoOpen(false), [todoOpen, setTodoOpen], {
    enabled: !!todoOpen,
  })

  useEffect(() => {
    setActiveIndex(0)
  }, [items])

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-id="${items[activeIndex]?.id}"]`)
    if (el instanceof HTMLElement) {
      el.scrollIntoView({ block: "center", behavior: "smooth" })
    }
  }, [activeIndex, items])

  return (
    <>
      <div ref={listRef} className="flex flex-1 flex-col gap-1 w-full overflow-auto">
        {items.map((item, i) => {
          const active = i === clamp(activeIndex)
          return (
            <div
              key={item.id}
              data-id={item.id}
              onClick={() => { setActiveIndex(i); handleOpen(item) }}
              className="cursor-pointer"
            >
              {item.kind === "todo" ? (
                <TodoCard todo={item} isActive={active} />
              ) : (
                <VacancyCard item={item} isActive={active} />
              )}
            </div>
          )
        })}
      </div>
      {todoOpen && <TodoDrawer />}
    </>
  )
}
