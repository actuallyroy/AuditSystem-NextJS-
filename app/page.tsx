"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Dashboard } from "@/components/dashboard"
import { Templates } from "@/components/templates"
import { Assignments } from "@/components/assignments"
import { Audits } from "@/components/audits"
import { Reports } from "@/components/reports"
import { Users } from "@/components/users"
import { Logs } from "@/components/logs"
import { UserProfile } from "@/components/user-profile"
import { TemplateBuilder } from "@/components/template-builder"
import { AuthPages } from "@/components/auth-pages"
import { useAuth } from "@/lib/auth-context"
import { Loader2 } from "lucide-react"
import { Settings } from "@/components/settings"

export default function Home() {
  const { isAuthenticated, isLoading, user, logout } = useAuth()
  const [activeView, setActiveView] = useState("dashboard")
  const [settingsTab, setSettingsTab] = useState("profile")
  const [authView, setAuthView] = useState<"login" | "signup" | "reset" | "recovery">("login")

  // Get user role from auth context
  const userRole = user?.role as "admin" | "manager" | "supervisor" | "auditor" || "manager" 

  // Show loading state
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  // Show auth pages if not authenticated
  if (!isAuthenticated) {
    return <AuthPages authView={authView} setAuthView={setAuthView} onAuthenticated={() => {}} />
  }

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return <Dashboard userRole={userRole} />
      case "templates":
        return <Templates setActiveView={setActiveView} />
      case "assignments":
        return <Assignments userRole={userRole} setActiveView={setActiveView} />
      case "audits":
        return <Audits />
      case "reports":
        return <Reports />
      case "users":
        return userRole === "admin" || userRole === "manager" ? <Users /> : <Dashboard userRole={userRole} />
      case "logs":
        return userRole === "admin" ? <Logs /> : <Dashboard userRole={userRole} />
      case "settings":
        return <Settings userRole={userRole} initialTab={settingsTab} setTab={setSettingsTab} />
      case "template-builder":
        return <TemplateBuilder />
      default:
        return <Dashboard userRole={userRole} />
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar activeView={activeView} setActiveView={setActiveView} userRole={userRole} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-gray-900">Retail Execution Audit System</h1>
            </div>
            <UserProfile onLogout={logout} setActiveView={setActiveView} setSettingsTab={setSettingsTab} />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 bg-gray-50 min-h-screen">{renderContent()}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
