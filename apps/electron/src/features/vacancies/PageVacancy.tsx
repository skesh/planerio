import { useAuthSelectors } from "@repo/core"
import { useEffect, useState } from "react"
import useGlobalKeybindings from "@/app/global-keybindings"
import { useHotkeys } from "@/shared/hooks/useHotkeys"
import { useVacancyFeedItems } from "./vacancyStore"
import { reloadData } from "./vacancyService"
import FeedList from "@/shared/ui/FeedList"

export default function PageVacancies() {
  const items = useVacancyFeedItems()
  const { activeAccountId } = useAuthSelectors()
  const [activeId, setActiveId] = useState<string>("")

  useEffect(() => {
    reloadData()
  }, [activeAccountId])

  useEffect(() => {
    if (items.length > 0 && !activeId) setActiveId(items[0].id)
  }, [items, activeId])

  const activeIndex = items.findIndex((i) => i.id === activeId)

  useHotkeys("KeyJ", () => {
    const next = activeIndex < items.length - 1 ? activeIndex + 1 : 0
    items[next] && setActiveId(items[next].id)
  }, [activeIndex, items])

  useHotkeys("KeyK", () => {
    const next = activeIndex > 0 ? activeIndex - 1 : items.length - 1
    items[next] && setActiveId(items[next].id)
  }, [activeIndex, items])

  useHotkeys("Enter", () => {
    const item = items[activeIndex]
    if (item?.kind === "vacancy") window.open(item.url, "_blank")
  }, [activeIndex, items])

  useGlobalKeybindings()

  return (
    <div className="flex flex-col flex-1">
      <div className="flex-col overflow-y-auto">
        <div className="flex flex-1 flex-col px-2 py-2">
          <FeedList items={items} activeId={activeId} />
        </div>
      </div>
    </div>
  )
}
