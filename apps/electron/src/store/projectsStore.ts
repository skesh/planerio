import { createProjectsStore } from "@repo/core"
import { ElectronStorageAdapter } from "./adapter"

const { useProjectStore, useProjectSelectors, useProjectActions } = createProjectsStore(
  new ElectronStorageAdapter(),
)

export { useProjectActions, useProjectSelectors, useProjectStore }
