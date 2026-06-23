import { router } from "expo-router"
import { Drawer } from "expo-router/drawer"
import { Sidebar } from "../../src/widgets/Sidebar"

export const unstable_settings = {
  anchor: "index",
}

export default function AppLayout() {
  return (
    <Drawer
      drawerContent={() => (
        <Sidebar
          onNavigate={(route) => {
            router.navigate(route as never)
          }}
        />
      )}
      screenOptions={{ headerShown: false }}
    />
  )
}
