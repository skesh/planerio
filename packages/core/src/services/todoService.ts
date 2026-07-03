import { apiFetch } from "../utils/apiFetch"
import { getActiveJwt } from "../store/auth"
import type { Todo } from "../models/todo"

export async function loadTodos() {
  const jwt = getActiveJwt()
  if (!jwt) return []
  return apiFetch<Todo[]>("/todos", jwt)
}
