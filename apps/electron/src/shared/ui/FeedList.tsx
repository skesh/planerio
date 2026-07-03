import type { FeedItem } from "@repo/core"
import { useEffect, useRef, useState } from "react"
import TodoCard from "@/entities/Todo/TodoCard"
import TodoDrawer from "@/entities/Todo/TodoDrawer"
import { useTodoActions, useTodoStore } from "@/store/todosStore"
import { useUiActions } from "@/store/uiStore"
import { useHotkeys } from "../hooks/useHotkeys"
import { VacancyCard } from "./VacancyCard"

type DrawerMode = "edit" | "add" | false

interface FeedListProps {
  items: FeedItem[]
}

export default function FeedList({ items }: FeedListProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(false)
  const { setDrawerOpen } = useUiActions()
  const listRef = useRef<HTMLDivElement>(null)
  const { toggleDone, toggleShowDone } = useTodoActions()

  const clamp = (i: number) => {
    if (items.length === 0) return 0
    return Math.min(Math.max(i, 0), items.length - 1)
  }

  const activeItem = items[activeIndex]

  const handleOpen = (item: FeedItem) => {
    if (item.kind === "todo") {
      setDrawerMode("edit")
    } else {
      window.open(item.url, "_blank")
    }
  }

  const drawerBlock = !!drawerMode

  useHotkeys("KeyJ", () => {
    const next = activeIndex < items.length - 1 ? activeIndex + 1 : 0
    const item = items[next]
    if (!item) return
    setActiveIndex(next)
  }, [activeIndex, items], { enabled: !drawerBlock })

  useHotkeys("KeyK", () => {
    const next = activeIndex > 0 ? activeIndex - 1 : items.length - 1
    const item = items[next]
    if (!item) return
    setActiveIndex(next)
  }, [activeIndex, items], { enabled: !drawerBlock })

  useHotkeys("Enter", () => {
    const item = items[activeIndex]
    if (item) handleOpen(item)
  }, [activeIndex, items], { enabled: !drawerBlock })

  useHotkeys("KeyI", () => setDrawerMode("edit"), [drawerBlock], { enabled: !drawerBlock })
  useHotkeys("KeyO", () => setDrawerMode("add"), [drawerBlock], { enabled: !drawerBlock })
  useHotkeys("KeyS", () => toggleShowDone(), [drawerBlock], { enabled: !drawerBlock })
  useHotkeys("D", () => {
    const activeItem = items[activeIndex]
    if (activeItem?.kind !== "todo") return
    const { items: storeItems, setItems } = useTodoStore.getState()
    setItems(storeItems.filter((i) => i.id !== activeItem.id))
  }, [activeIndex, items], { enabled: !drawerBlock })
  useHotkeys("d", () => {
    const activeItem = items[activeIndex]
    if (activeItem?.kind === "todo") toggleDone(activeItem.id)
  }, [activeIndex, items], { enabled: !drawerBlock })

  useHotkeys("Escape", () => setDrawerMode(false), [drawerMode], { enabled: drawerBlock })

  useEffect(() => {
    setActiveIndex(0)
  }, [items])

  useEffect(() => {
    setDrawerOpen(!!drawerMode)
  }, [drawerMode, setDrawerOpen])

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
      {drawerMode && <TodoDrawer open={drawerMode} onClose={() => setDrawerMode(false)} activeTodo={activeItem?.kind === "todo" ? activeItem : undefined} />}
    </>
  )
}
