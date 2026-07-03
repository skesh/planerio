import { apiFetch } from "../utils/apiFetch"
import { getActiveJwt } from "../store/auth"
import type { Project } from "../models/project"

export async function loadProjects() {
  const jwt = getActiveJwt()
  if (!jwt) return []
  return apiFetch<Project[]>("/projects", jwt)
}
