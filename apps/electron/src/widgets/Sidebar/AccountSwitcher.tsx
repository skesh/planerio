import { ChevronsUpDown, LogOut, Plus, RefreshCcw, UserRound } from "lucide-react"
import { useState } from "react"
import { logout, switchAccount, sync } from "@/features/auth/authBootstrap"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
import { SidebarFooter, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/shared/ui/sidebar"
import { useAuthSelectors } from "@/store/authStore"
import { LoginDialog } from "./LoginDialog"

export function AccountSwitcher() {
  const { accounts, activeAccount } = useAuthSelectors()
  const [loginOpen, setLoginOpen] = useState(false)

  const otherAccounts = accounts.filter((a) => a.id !== activeAccount?.id)

  return (
    <>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex size-8 items-center justify-center rounded-lg">
                    <UserRound className="size-4" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-medium text-sm truncate">
                      {activeAccount?.email ?? "Гостевой режим"}
                    </span>
                    {activeAccount && (
                      <span className="text-muted-foreground text-xs">аккаунт</span>
                    )}
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                {otherAccounts.map((account) => (
                  <DropdownMenuItem key={account.id} onClick={() => switchAccount(account.id)}>
                    <UserRound className="size-4" />
                    <span className="truncate">{account.email}</span>
                  </DropdownMenuItem>
                ))}
                {otherAccounts.length > 0 && <DropdownMenuSeparator />}
                <DropdownMenuItem onClick={() => setLoginOpen(true)}>
                  <Plus className="size-4" />
                  Добавить аккаунт
                </DropdownMenuItem>
                {activeAccount && (
                  <>
                    <DropdownMenuItem onClick={() => sync()}>
                      <RefreshCcw />
                      Sync
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => logout()}
                      className="text-destructive focus:text-destructive"
                    >
                      <LogOut className="size-4" />
                      Выйти
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  )
}
