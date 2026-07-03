import { create } from "zustand"
import { useShallow } from "zustand/shallow"
import { loginUser } from "../services/authService"

export interface Account {
  id: string
  email: string
  token: string
  lastSync: number
}

export interface AuthActions {
  initialize: (accounts: Account[], activeAccountId: string | null) => void
  addAccount: (account: Account) => void
  removeAccount: (id: string) => string | null
  setActiveAccountId: (id: string | null) => void
  reset: () => void
  login: (email: string, password: string) => Promise<Account>
}

interface AuthState {
  accounts: Account[]
  activeAccountId: string | null
  initialized: boolean
}

type AuthStore = AuthState & AuthActions

export function getActiveJwt() {
  const { accounts, activeAccountId } = useAuthStore.getState()
  return accounts.find((a) => a.id === activeAccountId)?.token
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  accounts: [],
  activeAccountId: null,
  initialized: false,

  initialize: (accounts, activeAccountId) => {
    set({ accounts, activeAccountId, initialized: true })
  },

  addAccount: (account) => {
    const { accounts } = get()
    const newAccounts = accounts.some((a) => a.id === account.id)
      ? accounts.map((a) => (a.id === account.id ? account : a))
      : [...accounts, account]
    set({ accounts: newAccounts })
  },

  removeAccount: (id) => {
    const { accounts, activeAccountId } = get()
    const newAccounts = accounts.filter((a) => a.id !== id)
    const newActiveId =
      id === activeAccountId ? (newAccounts[0]?.id ?? null) : activeAccountId
    set({ accounts: newAccounts, activeAccountId: newActiveId })
    return newActiveId
  },

  setActiveAccountId: (id) => {
    set({ activeAccountId: id })
  },

  reset: () => set({ accounts: [], activeAccountId: null, initialized: false }),

  login: async (email, password) => {
    const { token, user } = await loginUser(email, password)
    const account: Account = { id: user.id, email: user.email, token, lastSync: 0 }
    get().addAccount(account)
    get().setActiveAccountId(user.id)
    return account
  },
}))

export const useAuthSelectors = () =>
  useAuthStore(
    useShallow((s) => ({
      accounts: s.accounts,
      activeAccount: s.accounts.find((a) => a.id === s.activeAccountId),
      activeAccountId: s.activeAccountId,
    })),
  )

export const useAuthActions = () =>
  useAuthStore(
    useShallow((s) => ({
      initialize: s.initialize,
      addAccount: s.addAccount,
      removeAccount: s.removeAccount,
      setActiveAccountId: s.setActiveAccountId,
      reset: s.reset,
      login: s.login,
    })),
  )
