import { apiFetch } from "../utils/apiFetch"
import { getActiveJwt } from "../store/auth"
import type { Vacancy } from "../types/types"

export interface VacancyItem extends Vacancy {
  status: string
}

export async function loadVacancies() {
  const jwt = getActiveJwt()
  if (!jwt) return []
  return apiFetch<VacancyItem[]>("/vacancies", jwt)
}

export async function updateVacancyStatus(id: string, status: string) {
  const jwt = getActiveJwt()
  if (!jwt) return
  return apiFetch<{ status: string }>(`/vacancies/${id}/status`, jwt, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  })
}
