import "../global.css"
import { Stack } from "expo-router"
import { useEffect } from "react"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { initializeAuth } from "../src/services/authService"

export default function RootLayout() {
  useEffect(() => {
    initializeAuth()
  }, [])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(app)" />
      </Stack>
    </GestureHandlerRootView>
  )
}
