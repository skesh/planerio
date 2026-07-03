import type { FeedItem } from "@repo/core"
import { useRef } from "react"
import TodoCard from "@/entities/Todo/TodoCard"
import { VacancyCard } from "./VacancyCard"

interface FeedListProps {
  items: FeedItem[]
  activeId?: string
  onOpen?: (item: FeedItem) => void
}

export default function FeedList({ items, activeId, onOpen }: FeedListProps) {
  const listRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={listRef} className="flex flex-1 flex-col gap-1 w-full overflow-auto">
      {items.map((item) => {
        const active = item.id === activeId
        return (
          <div key={item.id} onClick={() => onOpen?.(item)} className="cursor-pointer">
            {item.kind === "todo" ? (
              <TodoCard todo={item} isActive={active} />
            ) : (
              <VacancyCard item={item} isActive={active} />
            )}
          </div>
        )
      })}
    </div>
  )
}
