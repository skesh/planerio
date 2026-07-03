import { apiFetch } from "../utils/apiFetch"
import { getActiveJwt } from "../store/auth"
import type { Todo } from "../types/types"

export async function loadTodos() {
  const jwt = getActiveJwt()
  if (!jwt) return []
  return apiFetch<Todo[]>("/todos", jwt)
}
