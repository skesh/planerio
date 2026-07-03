import type { FeedItem } from "@repo/core"
import { useEffect, useMemo, useRef, useState } from "react"
import TodoCard from "@/entities/Todo/TodoCard"
import TodoDrawer from "@/entities/Todo/TodoDrawer"
import { useTodoActions, useTodoStore } from "@/store/todosStore"
import { useUiActions, useUiSelectors } from "@/store/uiStore"
import { useHotkeys } from "../hooks/useHotkeys"
import { VacancyCard } from "./VacancyCard"

type DrawerMode = "edit" | "add" | false

interface FeedListProps {
  items: FeedItem[]
}

export default function FeedList({ items }: FeedListProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(false)
  const [showDone, setShowDone] = useState(false)
  const { toggleSidebar, setDrawerOpen } = useUiActions()
  const { editMode, sidebarOpen } = useUiSelectors()
  const listRef = useRef<HTMLDivElement>(null)
  const { toggleDone } = useTodoActions()

  const visibleItems = useMemo(
    () => items.filter((i) => i.kind !== "todo" || !i.done || showDone),
    [items, showDone],
  )

  const clamp = (i: number) => {
    if (visibleItems.length === 0) return 0
    return Math.min(Math.max(i, 0), visibleItems.length - 1)
  }

  const activeItem = visibleItems[activeIndex]

  const handleOpen = (item: FeedItem) => {
    if (item.kind === "todo") {
      setDrawerMode("edit")
    } else {
      window.open(item.url, "_blank")
    }
  }

  const drawerBlock = !!drawerMode

  useHotkeys(
    "KeyJ",
    () => {
      const next = activeIndex < visibleItems.length - 1 ? activeIndex + 1 : 0
      const item = visibleItems[next]
      if (!item) return
      setActiveIndex(next)
    },
    [activeIndex, visibleItems],
    { enabled: !drawerBlock },
  )

  useHotkeys(
    "KeyK",
    () => {
      const next = activeIndex > 0 ? activeIndex - 1 : visibleItems.length - 1
      const item = visibleItems[next]
      if (!item) return
      setActiveIndex(next)
    },
    [activeIndex, visibleItems],
    { enabled: !drawerBlock },
  )

  useHotkeys(
    "Enter",
    () => {
      const item = visibleItems[activeIndex]
      if (item) handleOpen(item)
    },
    [activeIndex, visibleItems],
    { enabled: !drawerBlock },
  )

  useHotkeys("KeyI", () => setDrawerMode("edit"), [drawerBlock], { enabled: !drawerBlock })
  useHotkeys("KeyO", () => setDrawerMode("add"), [drawerBlock], { enabled: !drawerBlock })
  useHotkeys("KeyS", () => setShowDone((s) => !s), [drawerBlock], { enabled: !drawerBlock })
  useHotkeys(
    "D",
    () => {
      const activeItem = visibleItems[activeIndex]
      if (activeItem?.kind !== "todo") return
      const { items: storeItems, setItems } = useTodoStore.getState()
      setItems(storeItems.filter((i) => i.id !== activeItem.id))
    },
    [activeIndex, visibleItems],
    { enabled: !drawerBlock },
  )
  useHotkeys(
    "d",
    () => {
      const activeItem = visibleItems[activeIndex]
      if (activeItem?.kind === "todo") toggleDone(activeItem.id)
    },
    [activeIndex, visibleItems],
    { enabled: !drawerBlock },
  )

  useHotkeys("Escape", () => setDrawerMode(false), [drawerMode], { enabled: drawerBlock })

  useHotkeys("KeyH", () => toggleSidebar(), [editMode, drawerBlock], {
    enabled: editMode === "normal" && !sidebarOpen && !drawerBlock,
  })

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.code === "KeyH") {
        e.preventDefault()
        window.ipcRenderer.invoke("window:minimize")
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  useEffect(() => {
    setActiveIndex(0)
  }, [visibleItems])

  useEffect(() => {
    setDrawerOpen(!!drawerMode)
  }, [drawerMode, setDrawerOpen])

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-id="${visibleItems[activeIndex]?.id}"]`)
    if (el instanceof HTMLElement) {
      el.scrollIntoView({ block: "center", behavior: "smooth" })
    }
  }, [activeIndex, visibleItems])

  return (
    <>
      <div ref={listRef} className="flex flex-1 flex-col gap-1 w-full overflow-auto">
        {visibleItems.map((item, i) => {
          const active = i === clamp(activeIndex)
          return (
            <div
              key={item.id}
              data-id={item.id}
              onClick={() => {
                setActiveIndex(i)
                handleOpen(item)
              }}
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
      {drawerMode && (
        <TodoDrawer
          open={drawerMode}
          onClose={() => setDrawerMode(false)}
          activeTodo={activeItem?.kind === "todo" ? activeItem : undefined}
        />
      )}
    </>
  )
}
