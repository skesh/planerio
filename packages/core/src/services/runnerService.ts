import { apiFetch } from "../utils/apiFetch"
import { getActiveJwt } from "../store/auth"

export interface RunnerDTO {
  id: string
  name: string
  type: string
  enabled: boolean
  schedule: string | null
  config: Record<string, unknown>
  status: string
  lastRunAt: string | null
  userId: string
}

export async function loadRunners(): Promise<RunnerDTO[]> {
  const jwt = getActiveJwt()
  if (!jwt) return []
  return apiFetch("/runners", jwt)
}

export async function getRunner(id: string): Promise<RunnerDTO> {
  const jwt = getActiveJwt()
  if (!jwt) throw new Error("Not authenticated")
  return apiFetch(`/runners/${id}`, jwt)
}

export async function runRunner(id: string): Promise<{ created: number }> {
  const jwt = getActiveJwt()
  if (!jwt) throw new Error("Not authenticated")
  return apiFetch(`/runners/${id}/run`, jwt, { method: "POST" })
}
