import { useEffect } from "react"
import { HashRouter, Route, Routes } from "react-router"
import TodoDrawer from "../entities/Todo/TodoDrawer.tsx"
import PageHome from "../pages/PageHome.tsx"
import PageInbox from "../pages/PageInbox.tsx"
import PageProject from "../pages/PageProject.tsx"
import { SidebarInset, SidebarProvider } from "../shared/ui/sidebar.tsx"
import { useProjectStore } from "../store/projectsStore.ts"
import { useTodoStore } from "../store/todosStore.ts"
import { useUiSelectors } from "../store/uiStore.ts"
import Footer from "../widgets/Footer.tsx"
import { CommandMenu } from "../widgets/Menu.tsx"
import { AppSidebar } from "../widgets/Sidebar/AppSidebar.tsx"

function App() {
  const initializeProjects = useProjectStore((s) => s.initialize)
  const initializeTodos = useTodoStore((s) => s.initialize)
  const { sidebarOpen } = useUiSelectors()

  useEffect(() => {
    initializeTodos()
    initializeProjects()
  }, [])

  useEffect(() => {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.classList.add("dark")
    }
  }, [])

  return (
    <HashRouter>
      <div>
        <SidebarProvider open={sidebarOpen} className="flex min-h-screen flex-col">
          <AppSidebar />
          <SidebarInset>
            <CommandMenu />
            {/* <Toolbar /> */}
            <Routes>
              <Route path="/" element={<PageHome />} />
              <Route path="/inbox" element={<PageInbox />} />
              <Route path="/project/:id" element={<PageProject />} />
            </Routes>
          </SidebarInset>
        </SidebarProvider>

        <TodoDrawer />
        <Footer />
      </div>
    </HashRouter>
  )
}

export default App
