import type { FeedItem } from "@repo/core"
import { filterInbox } from "@repo/core"
import { useMemo } from "react"
import { useTodoSelectors } from "@/store/todosStore"
import FeedList from "@/shared/ui/FeedList"

export default function PageInbox() {
  const { todos } = useTodoSelectors()

  const items: FeedItem[] = useMemo(
    () => filterInbox(todos).map((t) => Object.assign(Object.create(t), { kind: "todo" as const })),
    [todos],
  )

  return <FeedList items={items} />
}
