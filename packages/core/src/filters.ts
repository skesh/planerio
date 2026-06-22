import { compareAsc, isAfter, parse } from "date-fns"
import { DATE_FORMAT } from "./constants"
import type { Todo } from "./models/todo"

export function defaultSort(items: Todo[]): Todo[] {
  return [...items]
    .sort((a, b) => {
      if (!a.date && !b.date) return 0
      if (!a.date) return 1
      if (!b.date) return -1
      return compareAsc(
        parse(a.date, DATE_FORMAT, new Date()),
        parse(b.date, DATE_FORMAT, new Date()),
      )
    })
    .sort((a, b) => Number(b.priority) - Number(a.priority))
}

export function filterDone(items: Todo[], showDone: boolean): Todo[] {
  return showDone ? items : items.filter((i) => !i.done)
}

export function filterInbox(items: Todo[]): Todo[] {
  return items.filter((t) => t.projectId === "inbox")
}

export function filterNotInbox(items: Todo[]): Todo[] {
  return items.filter((t) => t.projectId !== "inbox")
}

export function filterProject(items: Todo[], projectId: string): Todo[] {
  return items.filter((t) => t.projectId === projectId)
}

export function filterRepeats(items: Todo[]): Todo[] {
  return items.filter((t) => t.repeat)
}

export function filterOverdueOrUndated(items: Todo[]): Todo[] {
  return items.filter((t) =>
    t.date ? isAfter(new Date(), parse(t.date, DATE_FORMAT, new Date())) : true,
  )
}

export function filterDependsOnReady(items: Todo[], allTodos: Todo[]): Todo[] {
  return items.filter((t) =>
    t.dependsOn.every((depId) => allTodos.find((t) => t.id === depId)?.done),
  )
}

export function filterAvailableForDependency(items: Todo[], excludeId: string): Todo[] {
  return items.filter((t) => t.id !== excludeId && !t.done)
}
