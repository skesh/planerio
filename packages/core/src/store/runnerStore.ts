import { create } from "zustand"
import { useShallow } from "zustand/shallow"
import {
  loadRunners as fetchRunners,
  getRunner as fetchRunner,
  runRunner as triggerRunner,
  type RunnerDTO,
} from "../services/runnerService"
import { isRunnerExpired } from "../utils/schedule"

export interface RunnerState {
  runners: RunnerDTO[]
  isUpdating: boolean
  loadRunners: () => Promise<void>
  triggerAndWait: (id: string, lastRunAt: string | null, schedule: string | null) => Promise<void>
  reset: () => void
}

export const useRunnerStore = create<RunnerState>((set, get) => ({
  runners: [],
  isUpdating: false,

  loadRunners: async () => {
    try {
      const runners = await fetchRunners()
      set({ runners })
    } catch (e) {
      console.error("[runnerStore] loadRunners error:", e)
    }
  },

  triggerAndWait: async (id, lastRunAt, schedule) => {
    const shouldTrigger =
      !lastRunAt || isRunnerExpired(lastRunAt, schedule)

    if (shouldTrigger) {
      const runner = get().runners.find((r) => r.id === id)
      if (runner?.status !== "running") {
        try {
          await triggerRunner(id)
        } catch {
          // 409 if scheduler already started it
        }
      }
    }

    set({ isUpdating: true })
    for (let i = 0; i < 150; i++) {
      await new Promise((r) => setTimeout(r, 2000))
      try {
        const r = await fetchRunner(id)
        set({
          runners: get().runners.map((rr) => (rr.id === id ? { ...rr, status: r.status, lastRunAt: r.lastRunAt } : rr)),
        })
        if (r.status === "idle" || r.status === "error") break
      } catch {
        break
      }
    }
    set({ isUpdating: false })
  },

  reset: () => set({ runners: [], isUpdating: false }),
}))

export const useRunnerSelectors = () =>
  useRunnerStore(
    useShallow((s) => ({
      runners: s.runners,
      isUpdating: s.isUpdating,
    })),
  )

export const useRunnerActions = () =>
  useRunnerStore(
    useShallow((s) => ({
      loadRunners: s.loadRunners,
      triggerAndWait: s.triggerAndWait,
      reset: s.reset,
    })),
  )
