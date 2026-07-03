import { create } from "zustand"
import { useShallow } from "zustand/shallow"
import { loadVacancies, updateVacancyStatus, type VacancyItem } from "../services/vacancyService"

let debounceTimer: ReturnType<typeof setTimeout> | null = null
let pendingStatus: { id: string; status: string } | null = null

export interface VacancyState {
  items: VacancyItem[]
  initialized: boolean
  isLoading: boolean
  reset: () => void
  initialize: () => Promise<void>
  setStatus: (id: string, status: string) => void
}

export const useVacancyStore = create<VacancyState>((set, get) => ({
  items: [],
  initialized: false,
  isLoading: false,

  initialize: async () => {
    if (get().initialized) return
    set({ isLoading: true })
    const items = await loadVacancies()
    const sorted = items.sort((a, b) => {
      const da = a.publishedAt.split(".").reverse().join("")
      const db = b.publishedAt.split(".").reverse().join("")
      return db.localeCompare(da)
    })
    set({ items: sorted, isLoading: false, initialized: true })
  },

  setStatus: (id: string, status: string) => {
    set((s) => ({
      items: s.items.map((i) => (i.id === id ? { ...i, status } : i)),
    }))

    pendingStatus = { id, status }

    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      const ps = pendingStatus
      pendingStatus = null
      if (ps) updateVacancyStatus(ps.id, ps.status)
    }, 10_000)
  },

  reset: () => set({ initialized: false, items: [] }),
}))

export const useVacancySelectors = () =>
  useVacancyStore(
    useShallow((s) => ({
      items: s.items,
      initialized: s.initialized,
    })),
  )

export const useVacancyActions = () =>
  useVacancyStore(
    useShallow((s) => ({
      reset: s.reset,
      initialize: s.initialize,
      setStatus: s.setStatus,
    })),
  )
