import type { Project } from "@repo/core"
import type { Todo } from "@repo/core"
import { useAuthStore } from "@/store/authStore"
import { useProjectStore } from "@/store/projectsStore"
import { useTodoStore } from "@/store/todosStore"

export function getNewTodos(): Todo[] {
  const { activeAccountId, accounts } = useAuthStore.getState()
  const { items } = useTodoStore.getState()

  const activeAccount = accounts.find((a) => a.id === activeAccountId)
  if (!activeAccount) return []

  const { lastSync } = activeAccount
  return lastSync ? items.filter((i) => new Date(i.updatedAt) > new Date(lastSync)) : items
}

export function getNewProjects(): Project[] {
  const { activeAccountId, accounts } = useAuthStore.getState()
  const { projects } = useProjectStore.getState()

  const activeAccount = accounts.find((a) => a.id === activeAccountId)
  if (!activeAccount) return []

  const { lastSync } = activeAccount
  return lastSync ? projects.filter((p) => new Date(p.updatedAt) > new Date(lastSync)) : projects
}
