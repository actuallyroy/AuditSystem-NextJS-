"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SettingsIcon, User, Building, Shield, Bell, Palette, Globe } from "lucide-react"
import { ProfileSettings } from "@/components/settings/profile-settings"
import { OrganizationSettings } from "@/components/settings/organization-settings"
import { SecuritySettings } from "@/components/settings/security-settings"
import { NotificationSettings } from "@/components/settings/notification-settings"
import { AppearanceSettings } from "@/components/settings/appearance-settings"
import { RegionalSettings } from "@/components/settings/regional-settings"

interface SettingsProps {
  userRole: "admin" | "manager" | "supervisor"
}

export function Settings({ userRole }: SettingsProps) {
  const [activeTab, setActiveTab] = useState("profile")

  const settingsTabs = [
    {
      id: "profile",
      label: "Profile",
      icon: User,
      description: "Manage your personal information",
      roles: ["admin", "manager", "supervisor"],
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
      roles: ["admin", "manager", "supervisor"],
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      description: "Configure notification preferences",
      roles: ["admin", "manager", "supervisor"],
    },
    {
      id: "appearance",
      label: "Appearance",
      icon: Palette,
      description: "Customize the interface",
      roles: ["admin", "manager", "supervisor"],
    },
    {
      id: "regional",
      label: "Regional",
      icon: Globe,
      description: "Language and regional settings",
      roles: ["admin", "manager", "supervisor"],
    },
  ]

  const filteredTabs = settingsTabs.filter((tab) => tab.roles.includes(userRole))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <SettingsIcon className="h-6 w-6" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <p className="text-gray-600">Manage your account and organization preferences</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="border-b">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:grid-cols-none lg:flex">
            {filteredTabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Settings Menu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {filteredTabs.map((tab) => (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <tab.icon className="h-4 w-4 mr-2" />
                    <div className="text-left">
                      <div className="font-medium">{tab.label}</div>
                      <div className="text-xs text-gray-500">{tab.description}</div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
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
        </div>
      </Tabs>
    </div>
  )
}
