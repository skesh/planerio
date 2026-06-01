import { API_URL, type Project, type Todo } from "@repo/core"
import { useAuthStore } from "@/store/authStore"
import { useProjectStore } from "@/store/projectsStore"
import { useTodoStore } from "@/store/todosStore"

export function getNewLocalProjects(): Project[] {
  const { activeAccountId, accounts } = useAuthStore.getState()
  const { projects } = useProjectStore.getState()

  const activeAccount = accounts.find((a) => a.id === activeAccountId)
  if (!activeAccount) return []

  const { lastSync } = activeAccount
  return lastSync
    ? projects.filter((p) => p?.updatedAt && new Date(p.updatedAt) > new Date(lastSync))
    : projects
}

export function getNewLocalTodos(): Todo[] {
  const { activeAccountId, accounts } = useAuthStore.getState()
  const { items } = useTodoStore.getState()

  const activeAccount = accounts.find((a) => a.id === activeAccountId)
  if (!activeAccount) return []

  const { lastSync } = activeAccount
  return lastSync
    ? items.filter((i) => i?.updatedAt && new Date(i.updatedAt) > new Date(lastSync))
    : items
}

export async function loadProjects(): Promise<Project[]> {
  const { accounts, activeAccountId } = useAuthStore.getState()
  const jwt = accounts.find((a) => a.id === activeAccountId)?.token
  const projectsRes = await fetch(`${API_URL}/projects`, {
    method: "GET",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
  })
  return projectsRes.json()
}

export async function loadTodos(): Promise<Todo[]> {
  const { accounts, activeAccountId } = useAuthStore.getState()
  const jwt = accounts.find((a) => a.id === activeAccountId)?.token
  const projectsRes = await fetch(`${API_URL}/todos`, {
    method: "GET",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
  })
  return projectsRes.json()
}
