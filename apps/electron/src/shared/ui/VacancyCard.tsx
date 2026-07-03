import { cn } from "@/shared/lib/utils"
import { Item, ItemContent, ItemMedia, ItemTitle } from "@/shared/ui/item"
import { ExternalLinkIcon } from "lucide-react"
import type { FeedItem } from "@repo/core"
import styles from "./vacancyCard.module.css"

export function VacancyCard({ item, isActive }: { item: FeedItem & { kind: "vacancy" }; isActive: boolean }) {
  const v = item

  return (
    <Item className={cn(isActive && styles.active)} data-id={v.id}>
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
