import type { Todo } from "../models/todo"
import type { Vacancy } from "./types"

export type FeedItem =
  | Todo & { kind: "todo" }
  | Vacancy & { kind: "vacancy" }
