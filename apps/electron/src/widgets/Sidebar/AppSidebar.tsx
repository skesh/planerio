import { nanoid } from "nanoid"
import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router"
import { cn } from "@/shared/lib/utils"
import { Input } from "@/shared/ui/input"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
} from "@/shared/ui/sidebar"
import { useProjectActions, useProjectSelectors } from "@/store/projectsStore"
import { useUiActions, useUiSelectors } from "@/store/uiStore.ts"
import { AccountSwitcher } from "@/widgets/Sidebar/AccountSwitcher"
import { useSidebarKeybindings } from "@/widgets/Sidebar/AppSidebar.keybinding"

const STATIC_NAV = [
  { id: "home", name: "Home", route: "/" },
  { id: "inbox", name: "Inbox", route: "/inbox" },
  { id: "repeats", name: "Repeats", route: "/repeats" },
]

export function AppSidebar() {
  const { projects } = useProjectSelectors()
  const { addProject, setId } = useProjectActions()
  const { editProjectOpen } = useUiSelectors()
  const { setEditProject, toggleSidebar } = useUiActions()
  const navigate = useNavigate()
  const location = useLocation()

  const [name, setName] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)

  const navItems = [
    ...STATIC_NAV,
    ...projects.map((p) => ({
      id: p.id,
      name: p.name,
      route: `/project/${p.id}`,
    })),
  ].filter((p) => p.route !== "/project/inbox")

  const onEnter = () => {
    const item = navItems[activeIndex]
    if (!item) return
    navigate(item.route)
    toggleSidebar()
  }

  useSidebarKeybindings(activeIndex, setActiveIndex, navItems.length, onEnter)

  // Установка активного элемента при перезагрузке проекта
  useEffect(() => {
    // if (location.pathname.includes("/inbox")) setActiveIndex(1)
    if (location.pathname.includes("/project")) {
      const projectId = location.pathname.slice(9)
      const index = projects.findIndex((p) => p.id === projectId)
      if (index) setActiveIndex(index + STATIC_NAV.length)
    }
  }, [projects])

  useEffect(() => {
    const projectIndex = activeIndex - STATIC_NAV.length
    if (projectIndex >= 0 && projects[projectIndex]) {
      setId(projects[projectIndex].id)
    }
  }, [activeIndex, projects])

  function submitProject() {
    if (name.trim()) {
      addProject({ id: nanoid(), name, description: "" })
      setName("")
      setEditProject(false)
    }
  }

  return (
    <Sidebar>
      <AccountSwitcher />
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-1">
            {STATIC_NAV.map((item, i) => (
              <SidebarMenuItem
                key={item.id}
                onClick={() => {
                  navigate(item.route)
                  toggleSidebar()
                }}
                className={cn(
                  "px-4",
                  "text-[16px]",
                  i === activeIndex && "bg-[deeppink]",
                  "rounded-[4px]",
                )}
              >
                {item.name}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {projects
                .filter((p) => p.id !== "inbox")
                .map((item, i) => (
                  <SidebarMenuItem
                    key={item.id}
                    onClick={() => {
                      navigate(`/project/${item.id}`)
                      toggleSidebar()
                    }}
                    className={cn(
                      "px-4",
                      "text-[16px]",
                      i + STATIC_NAV.length === activeIndex && "bg-[deeppink]",
                      "rounded-[4px]",
                    )}
                  >
                    {item.name}
                  </SidebarMenuItem>
                ))}

              {editProjectOpen && (
                <Input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitProject()}
                />
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
