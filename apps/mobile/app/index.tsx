import { useAuthStore } from "@repo/core"
import { Redirect } from "expo-router"

export default function Index() {
  const initialized = useAuthStore((s) => s.initialized)
  const activeAccountId = useAuthStore((s) => s.activeAccountId)

  if (!initialized) return null

  if (!activeAccountId) return <Redirect href="/login" />
  return <Redirect href="/(app)" />
}
