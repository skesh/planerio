import { API_URL, type Account, useAuthStore, getActiveJwt, loadTodos, loadProjects } from "@repo/core"
import { useProjectStore } from "@/store/projectsStore"
import { useTodoStore } from "@/store/todosStore"

const SYNC_INTERVAL = 10 * 60 * 1000

async function reloadData() {
  useTodoStore.getState().reset()
  useProjectStore.getState().reset()
  await useTodoStore.getState().initialize()
  await useProjectStore.getState().initialize()
}

export async function initializeAuth() {
  if (useAuthStore.getState().initialized) return

  const accounts = ((await window.ipcRenderer.auth.get("accounts")) as Account[]) ?? []
  const activeAccountId = ((await window.ipcRenderer.auth.get("activeAccountId")) as string) ?? null
  useAuthStore.getState().initialize(accounts, activeAccountId)

  if (activeAccountId) {
    await window.ipcRenderer.store.switch(activeAccountId)
  }
  await reloadData()
}

export async function login(email: string, password: string) {
  const account = await useAuthStore.getState().login(email, password)

  await window.ipcRenderer.auth.set("accounts", useAuthStore.getState().accounts)
  await window.ipcRenderer.auth.set("activeAccountId", account.id)
  await window.ipcRenderer.store.switch(account.id)

  await reloadData()
  await sync()
}

export async function logout(accountId?: string) {
  const { activeAccountId } = useAuthStore.getState()
  const targetId = accountId ?? activeAccountId
  if (!targetId) return

  const newActiveId = useAuthStore.getState().removeAccount(targetId)

  await window.ipcRenderer.auth.set("accounts", useAuthStore.getState().accounts)
  await window.ipcRenderer.auth.set("activeAccountId", newActiveId)

  if (targetId === activeAccountId) {
    await window.ipcRenderer.store.switch(newActiveId ?? "local")
    await reloadData()
  }
}

export async function switchAccount(accountId: string) {
  if (accountId === useAuthStore.getState().activeAccountId) return

  await window.ipcRenderer.store.switch(accountId)
  await window.ipcRenderer.auth.set("activeAccountId", accountId)
  useAuthStore.getState().setActiveAccountId(accountId)
  await reloadData()

  const account = useAuthStore.getState().accounts.find((a) => a.id === accountId)
  if (account && Date.now() - account.lastSync > SYNC_INTERVAL) {
    await sync()
  }
}

export async function sync() {
  const { items, setItems } = useTodoStore.getState()
  const { projects, saveProjects } = useProjectStore.getState()
  const jwt = getActiveJwt()
  if (!jwt) return

  const [serverProjects, serverTodos] = await Promise.all([
    loadProjects(),
    loadTodos(),
  ])

  const mergedTodos = serverTodos.map((st) => {
    const local = items.find((i) => i.id === st.id)
    return local && local.updatedAt && st.updatedAt
      ? (new Date(local.updatedAt) > new Date(st.updatedAt) ? local : st)
      : st
  })
  const localOnlyTodos = items.filter((i) => !serverTodos.find((st) => st.id === i.id))
  setItems([...mergedTodos, ...localOnlyTodos])

  const mergedProjects = serverProjects.map((sp) => {
    const local = projects.find((p) => p.id === sp.id)
    return local && local.updatedAt && sp.updatedAt
      ? (new Date(local.updatedAt) > new Date(sp.updatedAt) ? local : sp)
      : sp
  })
  const localOnlyProjects = projects.filter((p) => !serverProjects.find((sp) => sp.id === p.id))
  saveProjects([...mergedProjects, ...localOnlyProjects])

  await Promise.all([
    fetch(`${API_URL}/projects/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
      body: JSON.stringify([...mergedProjects, ...localOnlyProjects]),
    }),
    fetch(`${API_URL}/todos/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
      body: JSON.stringify([...mergedTodos, ...localOnlyTodos]),
    }),
  ])
}
