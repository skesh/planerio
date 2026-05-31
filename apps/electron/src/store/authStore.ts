import { create } from "zustand"
import { useShallow } from "zustand/shallow"

export interface Account {
  id: string
  email: string
  token: string
  lastSync: number
}

interface AuthState {
  accounts: Account[]
  activeAccountId: string | null
  initialized: boolean
}

export const useAuthStore = create<AuthState>(() => ({
  accounts: [],
  activeAccountId: null,
  initialized: false,
}))

export const useAuthSelectors = () =>
  useAuthStore(
    useShallow((s) => ({
      accounts: s.accounts,
      activeAccount: s.accounts.find((a) => a.id === s.activeAccountId),
      activeAccountId: s.activeAccountId,
    })),
  )
