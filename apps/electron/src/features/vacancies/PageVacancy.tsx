import { useAuthSelectors } from "@repo/core"
import { useEffect } from "react"
import { useVacancyFeedItems } from "./vacancyStore"
import { loadData } from "./vacancyService"
import FeedList from "@/shared/ui/FeedList"

export default function PageVacancies() {
  const items = useVacancyFeedItems()
  const { activeAccountId } = useAuthSelectors()

  useEffect(() => {
    loadData()
  }, [activeAccountId])

  return (
    <div className="flex flex-col flex-1">
      <div className="flex-col overflow-y-auto">
        <div className="flex flex-1 flex-col px-2 py-2">
          <FeedList items={items} />
        </div>
      </div>
    </div>
  )
}
