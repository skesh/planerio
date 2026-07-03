import { cn } from "@/shared/lib/utils"
import { Item, ItemContent, ItemMedia, ItemTitle } from "@/shared/ui/item"
import { ExternalLinkIcon } from "lucide-react"
import type { FeedItem } from "@repo/core"
import { useVacancyStore } from "@/features/vacancies/vacancyStore"
import styles from "./vacancyCard.module.css"

const statusColors: Record<string, string> = {
  applied: "bg-green-500",
  skipped: "bg-yellow-500",
  blocked: "bg-red-500",
}

export function VacancyCard({ item, isActive }: { item: FeedItem & { kind: "vacancy" }; isActive: boolean }) {
  const v = item
  const status = useVacancyStore((s) => s.items.find((i) => i.id === v.id)?.status ?? "new")

  return (
    <Item className={cn(isActive && styles.active)} data-id={v.id}>
      {status !== "new" && <div className={cn("w-2 h-2 rounded-full shrink-0 mt-1.5", statusColors[status])} />}
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
