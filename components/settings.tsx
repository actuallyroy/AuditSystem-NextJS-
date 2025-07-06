"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SettingsIcon, User, Building, Shield, Bell, Palette, Globe } from "lucide-react"
import { ProfileSettings } from "@/components/settings/profile-settings"
import { OrganizationSettings } from "@/components/settings/organization-settings"
import { SecuritySettings } from "@/components/settings/security-settings"
import { NotificationSettings } from "@/components/settings/notification-settings"
import { AppearanceSettings } from "@/components/settings/appearance-settings"
import { RegionalSettings } from "@/components/settings/regional-settings"

interface SettingsProps {
  userRole: "admin" | "manager" | "supervisor" | "auditor"
}

export function Settings({ userRole }: SettingsProps) {
  const [activeTab, setActiveTab] = useState("profile")

  const settingsTabs = [
    {
      id: "profile",
      label: "Profile",
      icon: User,
      description: "Manage your personal information",
      roles: ["admin", "manager", "supervisor", "auditor"],
    },
    {
      id: "organization",
      label: "Organization",
      icon: Building,
      description: "Manage organization settings and members",
      roles: ["admin", "manager"],
    },
    {
      id: "security",
      label: "Security",
      icon: Shield,
      description: "Password and security settings",
      roles: ["admin", "manager", "supervisor", "auditor"],
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      description: "Configure notification preferences",
      roles: ["admin", "manager", "supervisor", "auditor"],
    },
    {
      id: "appearance",
      label: "Appearance",
      icon: Palette,
      description: "Customize the interface",
      roles: ["admin", "manager", "supervisor", "auditor"],
    },
    {
      id: "regional",
      label: "Regional",
      icon: Globe,
      description: "Language and regional settings",
      roles: ["admin", "manager", "supervisor", "auditor"],
    },
  ]

  const filteredTabs = settingsTabs.filter((tab) => tab.roles.includes(userRole))

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <SettingsIcon className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Settings</h2>
          <p className="text-gray-600 mt-1">Manage your account and organization preferences</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <div className="border-b border-gray-200">
          <TabsList className="grid w-full h-auto p-1 bg-gray-50 rounded-lg" style={{ gridTemplateColumns: `repeat(${filteredTabs.length}, 1fr)` }}>
            {filteredTabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex flex-col items-center gap-2 py-3 px-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all min-h-[80px]"
              >
                <tab.icon className="h-5 w-5 flex-shrink-0" />
                <div className="text-center flex-1">
                  <div className="font-medium text-sm leading-tight">{tab.label}</div>
                  <div className="text-xs text-gray-500 hidden lg:block mt-1 line-clamp-2 leading-tight">{tab.description}</div>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Content */}
        <div className="min-h-[600px]">
          <TabsContent value="profile" className="mt-0">
            <ProfileSettings userRole={userRole} />
          </TabsContent>

          <TabsContent value="organization" className="mt-0">
            <OrganizationSettings userRole={userRole} />
          </TabsContent>

          <TabsContent value="security" className="mt-0">
            <SecuritySettings userRole={userRole} />
          </TabsContent>

          <TabsContent value="notifications" className="mt-0">
            <NotificationSettings userRole={userRole} />
          </TabsContent>

          <TabsContent value="appearance" className="mt-0">
            <AppearanceSettings userRole={userRole} />
          </TabsContent>

          <TabsContent value="regional" className="mt-0">
            <RegionalSettings userRole={userRole} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
