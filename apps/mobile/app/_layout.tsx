import "../global.css"
import { useEffect } from "react"
import { Stack } from "expo-router"
import { initializeAuth } from "../src/services/authService"

export default function RootLayout() {
  useEffect(() => {
    initializeAuth()
  }, [])

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="(app)" />
    </Stack>
  )
}
