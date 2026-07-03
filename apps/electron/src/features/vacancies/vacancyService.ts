import { useAuthStore, useVacancyStore } from "@repo/core"

export async function reloadData() {
  const { initialized, accounts, activeAccountId } = useAuthStore.getState()
  if (!initialized || !activeAccountId || !accounts.find((a) => a.id === activeAccountId)?.token) return
  useVacancyStore.getState().reset()
  await useVacancyStore.getState().initialize()
}
