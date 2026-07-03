import { useAuthStore, useVacancyStore } from "@repo/core"

export async function reloadData() {
  if (!useAuthStore.getState().initialized) return
  useVacancyStore.getState().reset()
  await useVacancyStore.getState().initialize()
}
