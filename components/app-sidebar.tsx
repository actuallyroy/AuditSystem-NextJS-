"use client"

import {
  BarChart3,
  FileText,
  ClipboardList,
  CheckSquare,
  PieChart,
  Users,
  Activity,
  Building2,
  Settings,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"

interface AppSidebarProps {
  activeView: string
  setActiveView: (view: string) => void
  userRole: "admin" | "manager" | "supervisor" | "auditor"
}

export function AppSidebar({ activeView, setActiveView, userRole }: AppSidebarProps) {
  const menuItems = [
    {
      title: "Dashboard",
      icon: BarChart3,
      id: "dashboard",
      roles: ["admin", "manager", "supervisor", "auditor"],
    },
    {
      title: "Templates",
      icon: FileText,
      id: "templates",
      roles: ["admin", "manager"],
      submenu: [
        { title: "All Templates", id: "templates" },
        { title: "Create Template", id: "template-builder" },
      ],
    },
    {
      title: "Assignments",
      icon: ClipboardList,
      id: "assignments",
      roles: ["admin", "manager", "supervisor", "auditor"],
    },
    {
      title: "Audits",
      icon: CheckSquare,
      id: "audits",
      roles: ["admin", "manager", "supervisor", "auditor"],
    },
    {
      title: "Reports",
      icon: PieChart,
      id: "reports",
      roles: ["admin", "manager", "supervisor"],
    },
  ]

  const adminItems = [
    {
      title: "Users",
      icon: Users,
      id: "users",
      roles: ["admin"],
    },
    {
      title: "Logs",
      icon: Activity,
      id: "logs",
      roles: ["admin"],
    },
  ]

  const systemItems = [
    {
      title: "Settings",
      icon: Settings,
      id: "settings",
      roles: ["admin", "manager", "supervisor", "auditor"],
    },
  ]

  const filteredMenuItems = menuItems.filter((item) => item.roles.includes(userRole))
  const filteredAdminItems = adminItems.filter((item) => item.roles.includes(userRole))
  const filteredSystemItems = systemItems.filter((item) => item.roles.includes(userRole))

  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-8 w-8 text-blue-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">RetailAudit</h2>
            <p className="text-sm text-gray-500 capitalize">{userRole}</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => {
                if (item.id === "templates") {
                  return (
                    <SidebarMenuItem key="templates">
                      <SidebarMenuButton
                        onClick={() => setActiveView("templates")}
                        isActive={activeView === "templates" || activeView === "template-builder"}
                        className="w-full justify-start"
                      >
                        <FileText className="h-4 w-4" />
                        <span>Templates</span>
                      </SidebarMenuButton>
                      <div className="ml-6 mt-1 space-y-1">
                        <SidebarMenuButton
                          onClick={() => setActiveView("templates")}
                          isActive={activeView === "templates"}
                          className="w-full justify-start text-sm py-1 h-8"
                        >
                          <span>All Templates</span>
                        </SidebarMenuButton>
                        <SidebarMenuButton
                          onClick={() => setActiveView("template-builder")}
                          isActive={activeView === "template-builder"}
                          className="w-full justify-start text-sm py-1 h-8"
                        >
                          <span>Create Template</span>
                        </SidebarMenuButton>
                      </div>
                    </SidebarMenuItem>
                  )
                }
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => setActiveView(item.id)}
                      isActive={activeView === item.id}
                      className="w-full justify-start"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {filteredAdminItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredAdminItems.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => setActiveView(item.id)}
                      isActive={activeView === item.id}
                      className="w-full justify-start"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredSystemItems.map((item: any) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => setActiveView(item.id)}
                    isActive={activeView === item.id}
                    className="w-full justify-start"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="text-xs text-gray-500">© 2025 RetailAudit System</div>
      </SidebarFooter>
    </Sidebar>
  )
}
