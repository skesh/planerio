import { createProjectsStore, createTodosStore } from "@repo/core"
import { AsyncStorageAdapter } from "./adapter"

const adapter = new AsyncStorageAdapter()

export const { useTodoStore, useTodoActions, useTodoSelectors } = createTodosStore(adapter)
export const { useProjectStore, useProjectSelectors, useProjectActions } =
  createProjectsStore(adapter)
