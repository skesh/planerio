import { nanoid } from "nanoid/non-secure"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
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
  { id: "vacancy", name: "Vacancy", route: "/vacancy" },
]

export function AppSidebar() {
  const { projects, activeProjectId } = useProjectSelectors()
  const { addProject } = useProjectActions()
  const { editProjectOpen, sidebarOpen } = useUiSelectors()
  const { setEditProject, toggleSidebar } = useUiActions()
  const navigate = useNavigate()

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

  useSidebarKeybindings(onEnter)

  useEffect(() => {
    if (!sidebarOpen) return
    const index = navItems.findIndex((p) => p.id === activeProjectId)
    if (index >= 0) setActiveIndex(index)
  }, [sidebarOpen, activeProjectId, projects])


  useEffect(() => {
    if (!sidebarOpen || editProjectOpen) return

    function handler(e: KeyboardEvent) {
      if (e.code === "KeyJ") {
        setActiveIndex((prev) => (prev < navItems.length - 1 ? prev + 1 : 0))
        e.preventDefault()
      }
      if (e.code === "KeyK") {
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : navItems.length - 1))
        e.preventDefault()
      }
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [sidebarOpen, editProjectOpen, navItems.length])

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
