import "../global.css"
import { Stack } from "expo-router"
import { Component, useEffect } from "react"
import { Text, View } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { initializeAuth } from "../src/services/authService"

class ErrorBoundary extends Component<{ children: React.ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: { componentStack?: string }) {
    console.log("[DBG] ErrorBoundary caught", error, info?.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
          <Text style={{ color: "red", fontSize: 16, marginBottom: 8 }}>Error</Text>
          <Text style={{ color: "gray" }}>{this.state.error.message}</Text>
        </View>
      )
    }
    return this.props.children
  }
}

export default function RootLayout() {
  console.log("[DBG] RootLayout render")
  useEffect(() => {
    console.log("[DBG] initializeAuth start")
    initializeAuth()
      .then(() => console.log("[DBG] initializeAuth done"))
      .catch((e) => console.log("[DBG] initializeAuth ERROR", e))
  }, [])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="(app)" />
          <Stack.Screen name="todo/[id]" />
        </Stack>
      </ErrorBoundary>
    </GestureHandlerRootView>
  )
}
