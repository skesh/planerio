import { createContext, useContext, useRef, useState } from "react"
import { Animated, Modal, Pressable, Text, TouchableWithoutFeedback, View } from "react-native"
import { router, Stack } from "expo-router"
import { useTheme } from "../../src/shared/lib/theme"
import { Sidebar } from "../../src/widgets/Sidebar"

const SIDEBAR_WIDTH = 280

interface SidebarContextType {
  open: () => void
}

const SidebarContext = createContext<SidebarContextType>({ open: () => {} })
export const useSidebar = () => useContext(SidebarContext)

export default function AppLayout() {
  const { colors } = useTheme()
  const [sidebarVisible, setSidebarVisible] = useState(false)
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current
  const fadeAnim = useRef(new Animated.Value(0)).current

  function openSidebar() {
    setSidebarVisible(true)
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start()
  }

  function closeSidebar() {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: -SIDEBAR_WIDTH, duration: 200, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setSidebarVisible(false))
  }

  function handleNavigate(route: string) {
    router.navigate(route as never)
    closeSidebar()
  }

  return (
    <SidebarContext.Provider value={{ open: openSidebar }}>
      <View style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.bg },
            headerTintColor: colors.text,
            headerTitleStyle: { fontWeight: "600" as const, color: colors.text },
            headerLeft: () => (
              <Pressable onPress={openSidebar} hitSlop={8} style={{ padding: 4 }}>
                <Text style={{ fontSize: 22, color: colors.text }}>☰</Text>
              </Pressable>
            ),
          }}
        >
          <Stack.Screen name="index" options={{ title: "Home" }} />
          <Stack.Screen name="inbox" options={{ title: "Inbox" }} />
          <Stack.Screen name="repeats" options={{ title: "Repeats" }} />
          <Stack.Screen name="project/[id]" options={{ title: "Project" }} />
        </Stack>

        <Modal visible={sidebarVisible} transparent animationType="none" onRequestClose={closeSidebar}>
          <View style={{ flex: 1, flexDirection: "row" }}>
            <Animated.View style={{ width: SIDEBAR_WIDTH, transform: [{ translateX: slideAnim }] }}>
              <Sidebar onNavigate={handleNavigate} />
            </Animated.View>
            <TouchableWithoutFeedback onPress={closeSidebar}>
              <Animated.View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", opacity: fadeAnim }} />
            </TouchableWithoutFeedback>
          </View>
        </Modal>
      </View>
    </SidebarContext.Provider>
  )
}
