import { createTodosStore } from "@repo/core"
import { ElectronStorageAdapter } from "./adapter"

const { useTodoStore, useTodoActions, useTodoSelectors } = createTodosStore(
  new ElectronStorageAdapter(),
)

export { useTodoActions, useTodoSelectors, useTodoStore }
