import type { FeedItem } from "@repo/core"
import { ExternalLinkIcon } from "lucide-react"
import { useRef, useState } from "react"
import { useVacancyStore } from "@/features/vacancies/vacancyStore"
import { cn } from "@/shared/lib/utils"
import { Item, ItemContent, ItemMedia, ItemTitle } from "@/shared/ui/item"
import { useUiSelectors } from "@/store/uiStore"
import { useHotkeys } from "../hooks/useHotkeys"
import styles from "./vacancyCard.module.css"

const statusColors: Record<string, string> = {
  applied: "bg-green-500",
  skipped: "bg-yellow-500",
  blocked: "bg-red-500",
}

const cycle: Record<string, string> = {
  new: "applied",
  applied: "skipped",
  skipped: "blocked",
  blocked: "new",
}

export function VacancyCard({
  item,
  isActive,
}: {
  item: FeedItem & { kind: "vacancy" }
  isActive: boolean
}) {
  const v = item
  const { drawerOpen } = useUiSelectors()
  const storeStatus = useVacancyStore((s) => s.items.find((i) => i.id === v.id)?.status ?? "new")
  const [pending, setPending] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const displayStatus = pending ?? storeStatus

  useHotkeys(
    "KeyM",
    () => {
      const current = pending ?? storeStatus
      const next = cycle[current] ?? "applied"
      clearTimeout(timerRef.current)
      setPending(next)
      timerRef.current = setTimeout(() => {
        setPending(null)
        useVacancyStore.getState().setStatus(v.id, next)
      }, 10_000)
    },
    [v.id, pending, storeStatus],
    { enabled: isActive && !drawerOpen },
  )



  return (
    <Item className={cn(isActive && styles.active)} data-id={v.id}>
      {displayStatus !== "new" && (
        <div className={cn("w-2 h-2 rounded-full shrink-0 mt-1.5", statusColors[displayStatus])} />
      )}
      <ItemMedia variant="icon">
        <ExternalLinkIcon />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>
          <span>{v.title}</span>
        </ItemTitle>
        <div className="flex gap-2 text-xs text-muted-foreground">
          <span>{v.company}</span>
          {v.salary && <span>{v.salary}</span>}
          {v.area && <span>{v.area}</span>}
        </div>
      </ItemContent>
      <div className="text-xs text-muted-foreground">{v.publishedAt}</div>
    </Item>
  )
}
