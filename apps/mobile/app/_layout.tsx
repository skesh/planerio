import "../global.css"
import { Stack } from "expo-router"
import { Component, useEffect } from "react"
import { Text, View } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { initializeAuth } from "../src/services/authService"
import { ThemeProvider } from "../src/shared/lib/theme"

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
        <View className="flex-1 items-center justify-center p-5">
          <Text className="text-red-500 text-base mb-2">Error</Text>
          <Text className="text-gray-500">{this.state.error.message}</Text>
        </View>
      )
    }
    return this.props.children
  }
}

export default function RootLayout() {
  useEffect(() => {
    initializeAuth().catch((e) => console.log("[DBG] initializeAuth ERROR", e))
  }, [])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <ErrorBoundary>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="(app)" />
            <Stack.Screen name="todo/[id]" />
          </Stack>
        </ErrorBoundary>
      </ThemeProvider>
    </GestureHandlerRootView>
  )
}
