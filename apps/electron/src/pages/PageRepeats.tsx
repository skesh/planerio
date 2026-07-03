import type { FeedItem } from "@repo/core"
import { filterRepeats } from "@repo/core"
import { useMemo } from "react"
import useGlobalKeybindings from "@/app/global-keybindings"
import { useTodoSelectors } from "@/store/todosStore"
import FeedList from "@/shared/ui/FeedList"

export default function PageRepeats() {
  const { todos } = useTodoSelectors()

  const items: FeedItem[] = useMemo(
    () => filterRepeats(todos).map((t) => Object.assign(Object.create(t), { kind: "todo" as const })),
    [todos],
  )

  useGlobalKeybindings()

  return <FeedList items={items} />
}
