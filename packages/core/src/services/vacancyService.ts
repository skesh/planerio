import { API_URL, useAuthStore } from "@repo/core"

export async function loadVacancies() {
  const { accounts, activeAccountId } = useAuthStore.getState()
  const jwt = accounts.find((a) => a.id === activeAccountId)?.token
  const projectsRes = await fetch(`${API_URL}/vacancies`, {
    method: "GET",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
  })
  return projectsRes.json()
}
