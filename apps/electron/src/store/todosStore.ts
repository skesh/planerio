import { useMemo } from "react"
import { createTodosStore, useShallow } from "@repo/core"
import { ElectronStorageAdapter } from "./adapter"

const { useTodoStore, useTodoActions, useTodoSelectors } = createTodosStore(
  new ElectronStorageAdapter(),
)

export const useTodoFeedItems = () => {
  const items = useTodoStore(useShallow((s) => s.items))
  return useMemo(
    () => items.map((t) => Object.assign(Object.create(t), { kind: "todo" as const })),
    [items],
  )
}

export { useTodoActions, useTodoSelectors, useTodoStore }
