import { useAuthStore } from "@repo/core"
import { Redirect } from "expo-router"

export default function Index() {
  const initialized = useAuthStore((s) => s.initialized)
  const activeAccountId = useAuthStore((s) => s.activeAccountId)

  console.log("[DBG] Index render", { initialized, activeAccountId })

  if (!initialized) {
    console.log("[DBG] Index → null (not initialized)")
    return null
  }

  if (!activeAccountId) {
    console.log("[DBG] Index → redirect /login")
    return <Redirect href="/login" />
  }

  console.log("[DBG] Index → redirect /(app)")
  return <Redirect href="/(app)" />
}
