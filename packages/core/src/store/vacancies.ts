import { create } from "zustand"
import { useShallow } from "zustand/shallow"
import { loadVacancies } from "../services/vacancyService"
import type { Vacancy } from "../types/types"

export interface VacancyState {
  items: Vacancy[]
  initialized: boolean
  isLoading: boolean
  reset: () => void
  initialize: () => Promise<void>
}

export const useVacancyStore = create<VacancyState>((set, get) => ({
  items: [],
  initialized: false,
  isLoading: false,

  initialize: async () => {
    if (get().initialized) return
    set({ isLoading: true })
    const items = await loadVacancies()
    set({ items, isLoading: false, initialized: true })
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
    })),
  )
