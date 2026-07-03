import type { FeedItem } from "@repo/core"
import { defaultSort, filterDependsOnReady, filterNotInbox, filterOverdueOrUndated } from "@repo/core"
import { useMemo } from "react"
import FeedList from "@/shared/ui/FeedList"
import { useTodoFeedItems } from "@/store/todosStore"

export default function PageHome() {
  const items = useTodoFeedItems()

  const sorted = useMemo(() => {
    const filtered = filterDependsOnReady(
      filterOverdueOrUndated(filterNotInbox(items)),
      items,
    )
    return defaultSort(filtered) as FeedItem[]
  }, [items])

  return (
    <div className="flex flex-col flex-1">
      <div className="flex-col overflow-y-auto">
        <div className="flex flex-1 flex-col px-2 py-2">
          <FeedList items={sorted} />
        </div>
      </div>
    </div>
  )
}
