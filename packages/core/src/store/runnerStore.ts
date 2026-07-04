import { create } from "zustand"
import { useShallow } from "zustand/shallow"
import {
  getRunner as fetchRunner,
  loadRunners as fetchRunners,
  type RunnerDTO,
  runRunner as triggerRunner,
} from "../services/runnerService"
import { isRunnerExpired } from "../utils/schedule"
import { getActiveJwt } from "./auth"

export interface RunnerState {
  runners: RunnerDTO[]
  initialized: boolean
  isUpdating: boolean
  loadRunners: () => Promise<void>
  triggerAndWait: (id: string, lastRunAt: string | null, schedule: string | null) => Promise<void>
  reset: () => void
}

export const useRunnerStore = create<RunnerState>((set, get) => ({
  runners: [],
  initialized: false,
  isUpdating: false,

  loadRunners: async () => {
    if (get().initialized) return
    if (!getActiveJwt()) return
    try {
      const runners = await fetchRunners()
      set({ runners, initialized: true })
    } catch (e) {
      console.error("[runnerStore] loadRunners error:", e)
    }
  },

  triggerAndWait: async (id, lastRunAt, schedule) => {
    const alreadyRunning = get().runners.find((r) => r.id === id)?.status === "running"
    const shouldTrigger = !lastRunAt || isRunnerExpired(lastRunAt, schedule)

    if (!shouldTrigger && !alreadyRunning) return

    if (shouldTrigger && !alreadyRunning) {
      try {
        await triggerRunner(id)
      } catch {
        // 409 if scheduler already started it
      }
    }

    set({ isUpdating: true })
    for (let i = 0; i < 150; i++) {
      await new Promise((r) => setTimeout(r, 2000))
      try {
        const r = await fetchRunner(id)
        set({
          runners: get().runners.map((rr) =>
            rr.id === id ? { ...rr, status: r.status, lastRunAt: r.lastRunAt } : rr,
          ),
        })
        if (r.status === "idle" || r.status === "error") break
      } catch {
        break
      }
    }
    set({ isUpdating: false })
  },

  reset: () => set({ runners: [], initialized: false, isUpdating: false }),
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
