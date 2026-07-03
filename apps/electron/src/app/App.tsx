import { useEffect } from "react"
import { HashRouter, Route, Routes } from "react-router"
import PageVacancies from "@/features/vacancies/PageVacancy.tsx"
import PageRepeats from "@/pages/PageRepeats.tsx"
import TodoDrawer from "../entities/Todo/TodoDrawer.tsx"
import { initializeAuth } from "../features/auth/authBootstrap.ts"
import PageHome from "../pages/PageHome.tsx"
import PageInbox from "../pages/PageInbox.tsx"
import PageProject from "../pages/PageProject.tsx"
import { SidebarInset, SidebarProvider } from "../shared/ui/sidebar.tsx"
import { useUiSelectors } from "../store/uiStore.ts"
import Footer from "../widgets/Footer.tsx"
import { CommandMenu } from "../widgets/Menu.tsx"
import { AppSidebar } from "../widgets/Sidebar/AppSidebar.tsx"

function App() {
  const { sidebarOpen } = useUiSelectors()

  useEffect(() => {
    initializeAuth()
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
              <Route path="/repeats" element={<PageRepeats />} />
              <Route path="/project/:id" element={<PageProject />} />
              <Route path="/vacancy" element={<PageVacancies />} />
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
