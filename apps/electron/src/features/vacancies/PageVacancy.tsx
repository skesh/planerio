import useGlobalKeybindings from "@/app/global-keybindings"
import { useAuthSelectors, useVacancySelectors } from "@repo/core"
import { useEffect } from "react"
import { reloadData } from "./vacancyService"

export default function PageVacancies() {
  const { items } = useVacancySelectors()
  const { activeAccountId } = useAuthSelectors()

  useEffect(() => {
    reloadData()
  }, [activeAccountId])
  useGlobalKeybindings()

  return (
    <div className="flex flex-col flex-1">
      <div className="flex-col overflow-y-auto">
        <div className="flex flex-1 flex-col px-2 py-2">
          {items.map((i) => (
            <span key={i.id}>
              {i.title} {i.company}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
