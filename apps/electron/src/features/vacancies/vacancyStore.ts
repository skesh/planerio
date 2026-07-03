import { useMemo } from "react"
import { useShallow, useVacancyStore } from "@repo/core"

export type { VacancyState } from "@repo/core"
export { useVacancyActions, useVacancySelectors, useVacancyStore } from "@repo/core"

export const useVacancyFeedItems = () => {
  const items = useVacancyStore(useShallow((s) => s.items))
  return useMemo(() => items.map((v) => ({ ...v, kind: "vacancy" as const })), [items])
}
