import { apiFetch } from "../utils/apiFetch"

export function loginUser(email: string, password: string) {
  return apiFetch<{ token: string; user: { id: string; email: string } }>(
    "/auth/login",
    undefined,
    { method: "POST", body: JSON.stringify({ email, password }) },
  )
}
