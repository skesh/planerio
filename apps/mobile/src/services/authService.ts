import AsyncStorage from "@react-native-async-storage/async-storage"
import type { Account } from "@repo/core"
import { useAuthStore } from "@repo/core"
import { API_URL } from "../config"
import { useProjectStore, useTodoStore } from "../store"

async function loadLocalData() {
  useTodoStore.getState().reset()
  useProjectStore.getState().reset()
  await useTodoStore.getState().initialize()
  await useProjectStore.getState().initialize()
}

async function pushLocalChanges(token: string) {
  const { items } = useTodoStore.getState()
  const { projects } = useProjectStore.getState()

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` }

  await Promise.all([
    fetch(`${API_URL}/projects/sync`, { method: "POST", headers, body: JSON.stringify(projects) }),
    fetch(`${API_URL}/todos/sync`, { method: "POST", headers, body: JSON.stringify(items) }),
  ])
}

export async function syncFromServer() {
  const { activeAccountId, accounts } = useAuthStore.getState()
  const token = accounts.find((a) => a.id === activeAccountId)?.token
  if (!token) return

  try {
    const headers = { Authorization: `Bearer ${token}` }
    const [todosRes, projectsRes] = await Promise.all([
      fetch(`${API_URL}/todos`, { headers }),
      fetch(`${API_URL}/projects`, { headers }),
    ])

    // Pull → merge → push
    const serverTodos: import("@repo/core").Todo[] = todosRes.ok ? await todosRes.json() : []
    const serverProjects: import("@repo/core").Project[] = projectsRes.ok ? await projectsRes.json() : []

    const { items } = useTodoStore.getState()
    const { projects } = useProjectStore.getState()

    const mergedTodos = serverTodos.map((st) => {
      const local = items.find((i) => i.id === st.id)
      return local && local.updatedAt && st.updatedAt
        ? (new Date(local.updatedAt) > new Date(st.updatedAt) ? local : st)
        : st
    })
    const localOnlyTodos = items.filter((i) => !serverTodos.find((st) => st.id === i.id))

    const mergedProjects = serverProjects.map((sp) => {
      const local = projects.find((p) => p.id === sp.id)
      return local && local.updatedAt && sp.updatedAt
        ? (new Date(local.updatedAt) > new Date(sp.updatedAt) ? local : sp)
        : sp
    })
    const localOnlyProjects = projects.filter((p) => !serverProjects.find((sp) => sp.id === p.id))

    await pushLocalChanges(token)

    await AsyncStorage.setItem("items", JSON.stringify([...mergedTodos, ...localOnlyTodos]))
    await AsyncStorage.setItem("projects", JSON.stringify([...mergedProjects, ...localOnlyProjects]))

    useTodoStore.getState().reset()
    useProjectStore.getState().reset()
    await useTodoStore.getState().initialize()
    await useProjectStore.getState().initialize()
  } catch (e) {
    console.log("[DBG] syncFromServer error", e)
  }
}

export async function initializeAuth() {
  if (useAuthStore.getState().initialized) return

  const accountsRaw = await AsyncStorage.getItem("auth:accounts")
  const activeAccountIdRaw = await AsyncStorage.getItem("auth:activeAccountId")

  const accounts: Account[] = accountsRaw ? JSON.parse(accountsRaw) : []
  const activeAccountId: string | null = activeAccountIdRaw ?? null

  useAuthStore.setState({ accounts, activeAccountId, initialized: true })
  await loadLocalData()
  syncFromServer()
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

  await AsyncStorage.setItem("auth:accounts", JSON.stringify(newAccounts))
  await AsyncStorage.setItem("auth:activeAccountId", user.id)
  useAuthStore.setState({ accounts: newAccounts, activeAccountId: user.id })

  await loadLocalData()
  syncFromServer()
}

export async function switchAccount(accountId: string) {
  const { accounts } = useAuthStore.getState()
  if (!accounts.find((a) => a.id === accountId)) return

  await AsyncStorage.setItem("auth:activeAccountId", accountId)
  useAuthStore.setState({ activeAccountId: accountId })
  await loadLocalData()
  syncFromServer()
}

export async function logout() {
  const { accounts, activeAccountId } = useAuthStore.getState()
  if (!activeAccountId) return

  const newAccounts = accounts.filter((a) => a.id !== activeAccountId)
  const newActiveId = newAccounts[0]?.id ?? null

  await AsyncStorage.setItem("auth:accounts", JSON.stringify(newAccounts))
  if (newActiveId) {
    await AsyncStorage.setItem("auth:activeAccountId", newActiveId)
  } else {
    await AsyncStorage.removeItem("auth:activeAccountId")
  }

  useAuthStore.setState({ accounts: newAccounts, activeAccountId: newActiveId })
  await loadLocalData()
  syncFromServer()
}
