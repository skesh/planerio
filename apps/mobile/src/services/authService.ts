import AsyncStorage from "@react-native-async-storage/async-storage"
import type { Account } from "@repo/core"
import { API_URL, useAuthStore } from "@repo/core"
import { useProjectStore, useTodoStore } from "../store"

async function reloadData() {
  useTodoStore.getState().reset()
  useProjectStore.getState().reset()
  await useTodoStore.getState().initialize()
  await useProjectStore.getState().initialize()
}

export async function initializeAuth() {
  if (useAuthStore.getState().initialized) return
  useAuthStore.setState({ initialized: true })

  const accountsRaw = await AsyncStorage.getItem("auth:accounts")
  const activeAccountIdRaw = await AsyncStorage.getItem("auth:activeAccountId")

  const accounts: Account[] = accountsRaw ? JSON.parse(accountsRaw) : []
  const activeAccountId: string | null = activeAccountIdRaw ?? null

  useAuthStore.setState({ accounts, activeAccountId })
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

  await AsyncStorage.setItem("auth:accounts", JSON.stringify(newAccounts))
  await AsyncStorage.setItem("auth:activeAccountId", user.id)
  useAuthStore.setState({ accounts: newAccounts, activeAccountId: user.id })

  await reloadData()
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
  await reloadData()
}
