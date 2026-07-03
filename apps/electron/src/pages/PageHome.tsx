import type { FeedItem } from "@repo/core"
import {
  defaultSort,
  filterDependsOnReady,
  filterDone,
  filterNotInbox,
  filterOverdueOrUndated,
} from "@repo/core"
import { useMemo } from "react"
import FeedList from "@/shared/ui/FeedList"
import { useTodoFeedItems } from "@/store/todosStore"
import { useUiSelectors } from "@/store/uiStore"

export default function PageHome() {
  const items = useTodoFeedItems()
  const { showDone } = useUiSelectors()

  const sorted = useMemo(() => {
    const filtered = filterDependsOnReady(
      filterOverdueOrUndated(filterNotInbox(filterDone(items, showDone))),
      items,
    )
    return defaultSort(filtered) as FeedItem[]
  }, [items, showDone])

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
