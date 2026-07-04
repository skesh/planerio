import type { FeedItem } from "@repo/core"
import { useEffect, useMemo, useRef, useState } from "react"
import TodoCard from "@/entities/Todo/TodoCard"
import TodoDrawer from "@/entities/Todo/TodoDrawer"
import { useTodoActions, useTodoStore } from "@/store/todosStore"
import { useUiActions, useUiSelectors } from "@/store/uiStore"
import { useVacancyStore } from "@/features/vacancies/vacancyStore"
import { useHotkeys } from "../hooks/useHotkeys"
import { VacancyCard } from "./VacancyCard"

interface FeedListProps {
  items: FeedItem[]
}

export default function FeedList({ items }: FeedListProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [showDone, setShowDone] = useState(false)
  const { toggleSidebar, setDrawerOpen } = useUiActions()
  const { editMode, sidebarOpen, drawerOpen } = useUiSelectors()
  const listRef = useRef<HTMLDivElement>(null)
  const { toggleDone } = useTodoActions()

  const vacancyStoreItems = useVacancyStore((s) => s.items)
  const [pendingIds, setPendingIds] = useState<string[]>([])
  const pendingRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const visibleItems = useMemo(
    () => items.filter((i) => {
      if (i.kind === "todo") return !i.done || showDone

      const status = vacancyStoreItems.find((v) => v.id === i.id)?.status ?? "new"
      return showDone || status === "new" || pendingIds.includes(i.id)
    }),
    [items, showDone, vacancyStoreItems, pendingIds],
  )

  const prevIdsRef = useRef("")

  const clamp = (i: number) => {
    if (visibleItems.length === 0) return 0
    return Math.min(Math.max(i, 0), visibleItems.length - 1)
  }

  const activeItem = visibleItems[activeIndex]

  useHotkeys(
    "KeyJ",
    () => {
      const next = activeIndex < visibleItems.length - 1 ? activeIndex + 1 : 0
      const item = visibleItems[next]
      if (!item) return
      setActiveIndex(next)
    },
    [activeIndex, visibleItems],
    { enabled: !drawerOpen },
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
    { enabled: !drawerOpen },
  )

  useHotkeys("KeyI", () => {
    const item = visibleItems[activeIndex]
    if (item?.kind === "vacancy") {
      window.ipcRenderer.invoke("shell:open-url", (item as any).url)
      return
    }
    setDrawerOpen("edit")
  }, [activeIndex, visibleItems], { enabled: !drawerOpen })
  useHotkeys("KeyO", () => setDrawerOpen("add"), [drawerOpen], { enabled: !drawerOpen })
  useHotkeys("KeyS", () => setShowDone((s) => !s), [drawerOpen], { enabled: !drawerOpen })
  useHotkeys(
    "D",
    () => {
      const activeItem = visibleItems[activeIndex]
      if (activeItem?.kind !== "todo") return
      const { items: storeItems, setItems } = useTodoStore.getState()
      setItems(storeItems.filter((i) => i.id !== activeItem.id))
    },
    [activeIndex, visibleItems],
    { enabled: !drawerOpen },
  )
  useHotkeys(
    "d",
    () => {
      const activeItem = visibleItems[activeIndex]
      if (activeItem?.kind === "todo") toggleDone(activeItem.id)
    },
    [activeIndex, visibleItems],
    { enabled: !drawerOpen },
  )

  useHotkeys("Escape", () => setDrawerOpen(false), [drawerOpen], { enabled: !!drawerOpen })

  useHotkeys("KeyH", () => toggleSidebar(), [editMode, drawerOpen], {
    enabled: editMode === "normal" && !sidebarOpen && !drawerOpen,
  })

  useHotkeys(
    "KeyM",
    () => {
      const item = visibleItems[activeIndex]
      if (item?.kind !== "vacancy") return

      const cycle: Record<string, string> = {
        new: "applied",
        applied: "skipped",
        skipped: "blocked",
        blocked: "new",
      }
      const store = useVacancyStore.getState()
      const current = store.items.find((i) => i.id === item.id)?.status ?? "new"
      store.setStatus(item.id, cycle[current] ?? "applied")

      const oldTimer = pendingRef.current.get(item.id)
      if (oldTimer) clearTimeout(oldTimer)
      const timer = setTimeout(() => {
        pendingRef.current.delete(item.id)
        setPendingIds((prev) => prev.filter((id) => id !== item!.id))
      }, 10_000)
      pendingRef.current.set(item.id, timer)
      setPendingIds((prev) => (prev.includes(item.id) ? prev : [...prev, item.id]))
    },
    [activeIndex, visibleItems],
    { enabled: !drawerOpen },
  )

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
    const ids = visibleItems.map((i) => i.id).join(",")
    if (prevIdsRef.current !== ids) {
      prevIdsRef.current = ids
      setActiveIndex(0)
    }
  }, [visibleItems])

  useEffect(() => {
    if (!activeItem) return
    const el = listRef.current?.querySelector(`[data-id="${activeItem.id}"]`)
    el?.scrollIntoView({ block: "nearest" })
  }, [activeIndex])

  const onClose = () => {
    setDrawerOpen(false)
  }

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
      {drawerOpen && (
        <TodoDrawer
          open={drawerOpen}
          onClose={onClose}
          activeTodo={activeItem?.kind === "todo" ? activeItem : undefined}
        />
      )}
    </>
  )
}
