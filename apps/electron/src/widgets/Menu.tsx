"use client"

import { FolderIcon, HomeIcon, InboxIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router"
import { Project } from "@repo/core"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/shared/ui/command"
import { useProjectActions, useProjectSelectors } from "@/store/projectsStore"
import { useUiActions, useUiSelectors } from "@/store/uiStore"

export function CommandMenu() {
  const { menuOpen } = useUiSelectors()
  const { toggleMenu } = useUiActions()
  const { projects } = useProjectSelectors()
  const { addProject, deleteById } = useProjectActions()
  const navigate = useNavigate()

  const [showAddProject, setShowAddProject] = useState(false)
  const [projectName, setProjectName] = useState("")

  const listRef = useRef<HTMLDivElement>(null)
  const lastKeyRef = useRef<string | null>(null)
  const lastTimeRef = useRef<number>(0)

  useEffect(() => {
    if (!menuOpen) return

    const down = (e: KeyboardEvent) => {
      const now = Date.now()

      if (menuOpen) {
        if (e.key === "Escape" || e.key === "q") {
          e.preventDefault()
          if (showAddProject) {
            setShowAddProject(false)
            return
          } else {
            toggleMenu()
          }
          return
        }

        if ((e.key === "j" || e.key === "о") && !showAddProject) {
          e.preventDefault()
          const listEl = listRef.current
          if (listEl) {
            listEl.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }))
          }
          return
        }

        if ((e.key === "a" || e.key === "ф") && !showAddProject) {
          e.preventDefault()
          setShowAddProject(!showAddProject)
          return
        }

        if ((e.key === "k" || e.key === "л") && !showAddProject) {
          e.preventDefault()
          const listEl = listRef.current
          if (listEl) {
            listEl.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }))
          }
          return
        }

        if (e.key === "Enter" || ((e.key === "l" || e.key === "д") && !showAddProject)) {
          e.preventDefault()
          const selected = listRef.current?.querySelector('[role="option"][aria-selected="true"]')
          if (selected) {
            selected.dispatchEvent(new MouseEvent("click", { bubbles: true }))
          }
        }

        if (e.key === "D" && !showAddProject) {
          e.preventDefault()
          const selected = listRef.current?.querySelector('[role="option"][aria-selected="true"]')
          if (!selected) return
          const raw = selected.getAttribute("data-value")
          if (!raw) return
          const value = decodeURIComponent(raw)
          if (value === "home" || value === "inbox") return
          if (!projects.some((p) => p.id === value)) return
          navigate("/")
          handleDeleteById(value)
        }
      }

      lastKeyRef.current = e.key
      lastTimeRef.current = now
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [menuOpen, showAddProject, projects, toggleMenu])

  useEffect(() => {
    if (!menuOpen) {
      setShowAddProject(false)
      setProjectName("")
    }
  }, [menuOpen])

  function handleAddProject(name: string) {
    const trimmedName = name.trim()
    if (!trimmedName) return

    addProject(new Project({ name: trimmedName }))
    setProjectName("")
    setShowAddProject(false)
  }

  const handleDeleteById = (id: string) => deleteById(id)

  return (
    <div className="flex flex-col gap-4">
      {menuOpen && (
        <CommandDialog open={menuOpen} className="max-h-[70vh]">
          <Command shouldFilter={false}>
            {showAddProject && (
              <CommandInput
                placeholder="Add new project name..."
                value={projectName}
                onValueChange={(e) => setProjectName(e)}
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return
                  e.preventDefault()
                  e.stopPropagation()
                  handleAddProject(projectName)
                }}
                autoFocus
              />
            )}
            <CommandList ref={listRef} className="max-h-[calc(70vh-3rem)]">
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Navigation">
                <CommandItem
                  value="home"
                  onSelect={() => {
                    navigate("/")
                    toggleMenu()
                  }}
                >
                  <HomeIcon />
                  <span>Home</span>
                </CommandItem>
                <CommandItem
                  value="inbox"
                  onSelect={() => {
                    navigate("/inbox")
                    toggleMenu()
                  }}
                >
                  <InboxIcon />
                  <span>Inbox</span>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />

              {projects.length > 0 && (
                <CommandGroup heading="Projects">
                  {projects.map((p) => (
                    <CommandItem
                      key={p.id}
                      value={p.id}
                      onSelect={() => {
                        navigate(`/project/${p.id} `)
                        toggleMenu()
                      }}
                    >
                      <FolderIcon />
                      <span>{p.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </CommandDialog>
      )}
    </div>
  )
}
