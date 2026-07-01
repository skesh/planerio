import { API_URL } from "@repo/core"
import type { Account } from "@/store/authStore"
import { useAuthStore } from "@/store/authStore"
import { useProjectStore } from "@/store/projectsStore"
import { useTodoStore } from "@/store/todosStore"
import { loadProjects, loadTodos } from "../todo/todoService"

const SYNC_INTERVAL = 10 * 60 * 1000

async function reloadData() {
  useTodoStore.getState().reset()
  useProjectStore.getState().reset()
  await useTodoStore.getState().initialize()
  await useProjectStore.getState().initialize()
}

export async function initializeAuth() {
  if (useAuthStore.getState().initialized) return
  useAuthStore.setState({ initialized: true })

  const accounts = ((await window.ipcRenderer.auth.get("accounts")) as Account[]) ?? []
  const activeAccountId = ((await window.ipcRenderer.auth.get("activeAccountId")) as string) ?? null

  useAuthStore.setState({ accounts, activeAccountId })

  if (activeAccountId) {
    await window.ipcRenderer.store.switch(activeAccountId)
  }
  await reloadData()
}

export async function login(email: string, password: string) {
  const { accounts } = useAuthStore.getState()

  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error ?? "Login failed")
  }
  const { token, user } = await res.json()

  const account: Account = { id: user.id, email: user.email, token, lastSync: 0 }
  const newAccounts = accounts.some((a) => a.id === user.id)
    ? accounts.map((a) => (a.id === user.id ? account : a))
    : [...accounts, account]

  await window.ipcRenderer.auth.set("accounts", newAccounts)
  await window.ipcRenderer.auth.set("activeAccountId", user.id)
  useAuthStore.setState({ accounts: newAccounts, activeAccountId: user.id })

  await window.ipcRenderer.store.switch(user.id)
  await reloadData()
  await sync()
}

export async function logout(accountId?: string) {
  const { accounts, activeAccountId } = useAuthStore.getState()
  const targetId = accountId ?? activeAccountId
  if (!targetId) return

  const newAccounts = accounts.filter((a) => a.id !== targetId)
  const newActiveId = targetId === activeAccountId ? (newAccounts[0]?.id ?? null) : activeAccountId

  await window.ipcRenderer.auth.set("accounts", newAccounts)
  await window.ipcRenderer.auth.set("activeAccountId", newActiveId)
  useAuthStore.setState({ accounts: newAccounts, activeAccountId: newActiveId })

  if (targetId === activeAccountId) {
    await window.ipcRenderer.store.switch(newActiveId ?? "local")
    await reloadData()
  }
}

export async function switchAccount(accountId: string) {
  if (accountId === useAuthStore.getState().activeAccountId) return

  await window.ipcRenderer.store.switch(accountId)
  await window.ipcRenderer.auth.set("activeAccountId", accountId)
  useAuthStore.setState({ activeAccountId: accountId })
  await reloadData()

  const account = useAuthStore.getState().accounts.find((a) => a.id === accountId)
  if (account && Date.now() - account.lastSync > SYNC_INTERVAL) {
    await sync()
  }
}

export async function sync() {
  const { accounts, activeAccountId } = useAuthStore.getState()
  const { items, setItems } = useTodoStore.getState()
  const { projects, saveProjects } = useProjectStore.getState()
  const jwt = accounts.find((a) => a.id === activeAccountId)?.token
  if (!jwt) return

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${jwt}`,
  }

  // Pull first — получить свежие данные с сервера
  const [serverProjects, serverTodos] = await Promise.all([
    loadProjects(),
    loadTodos(),
  ])

  // Слить: серверные + локальные (локальные, которых нет на сервере)
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

  // Push — отправить слитые данные на сервер
  await Promise.all([
    fetch(`${API_URL}/projects/sync`, { method: "POST", headers, body: JSON.stringify([...mergedProjects, ...localOnlyProjects]) }),
    fetch(`${API_URL}/todos/sync`, { method: "POST", headers, body: JSON.stringify([...mergedTodos, ...localOnlyTodos]) }),
  ])
}
