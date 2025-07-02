"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, Mail, Smartphone, AlertTriangle, CheckCircle, Clock, Users } from "lucide-react"

interface NotificationSettingsProps {
  userRole: "admin" | "manager" | "supervisor" | "auditor"
}

export function NotificationSettings({ userRole }: NotificationSettingsProps) {
  const [notifications, setNotifications] = useState({
    email: {
      auditCompleted: true,
      auditFlagged: true,
      assignmentCreated: true,
      assignmentOverdue: true,
      teamUpdates: true,
      systemUpdates: false,
    },
    push: {
      auditCompleted: true,
      auditFlagged: true,
      assignmentCreated: false,
      assignmentOverdue: true,
      teamUpdates: false,
      systemUpdates: false,
    },
    frequency: "immediate",
    quietHours: {
      enabled: true,
      start: "22:00",
      end: "08:00",
    },
  })

  const updateNotification = (type: "email" | "push", key: string, value: boolean) => {
    setNotifications((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [key]: value,
      },
    }))
  }

  const notificationTypes = [
    {
      key: "auditCompleted",
      label: "Audit Completed",
      description: "When an auditor completes an audit",
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      key: "auditFlagged",
      label: "Audit Flagged",
      description: "When an audit is flagged for review",
      icon: AlertTriangle,
      color: "text-red-600",
    },
    {
      key: "assignmentCreated",
      label: "New Assignment",
      description: "When a new assignment is created",
      icon: Clock,
      color: "text-blue-600",
    },
    {
      key: "assignmentOverdue",
      label: "Assignment Overdue",
      description: "When an assignment becomes overdue",
      icon: AlertTriangle,
      color: "text-orange-600",
    },
    {
      key: "teamUpdates",
      label: "Team Updates",
      description: "Updates about your team members",
      icon: Users,
      color: "text-purple-600",
    },
    {
      key: "systemUpdates",
      label: "System Updates",
      description: "System maintenance and feature updates",
      icon: Bell,
      color: "text-gray-600",
    },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>Configure how and when you receive notifications</CardDescription>
        </CardHeader>
      </Card>

      {/* Notification Frequency */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Frequency</CardTitle>
          <CardDescription>Choose how often you want to receive notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select
              value={notifications.frequency}
              onValueChange={(value) => setNotifications({ ...notifications, frequency: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="hourly">Hourly Digest</SelectItem>
                <SelectItem value="daily">Daily Digest</SelectItem>
                <SelectItem value="weekly">Weekly Digest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>Choose which events trigger email notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {notificationTypes.map((type) => (
              <div key={type.key} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 bg-gray-100 rounded-lg`}>
                    <type.icon className={`h-4 w-4 ${type.color}`} />
                  </div>
                  <div>
                    <div className="font-medium">{type.label}</div>
                    <div className="text-sm text-gray-500">{type.description}</div>
                  </div>
                </div>
                <Switch
                  checked={notifications.email[type.key as keyof typeof notifications.email]}
                  onCheckedChange={(checked) => updateNotification("email", type.key, checked)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>Choose which events trigger push notifications on your devices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {notificationTypes.map((type) => (
              <div key={type.key} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 bg-gray-100 rounded-lg`}>
                    <type.icon className={`h-4 w-4 ${type.color}`} />
                  </div>
                  <div>
                    <div className="font-medium">{type.label}</div>
                    <div className="text-sm text-gray-500">{type.description}</div>
                  </div>
                </div>
                <Switch
                  checked={notifications.push[type.key as keyof typeof notifications.push]}
                  onCheckedChange={(checked) => updateNotification("push", type.key, checked)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle>Quiet Hours</CardTitle>
          <CardDescription>Set times when you don't want to receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-medium">Enable Quiet Hours</div>
              <div className="text-sm text-gray-500">Pause notifications during specified hours</div>
            </div>
            <Switch
              checked={notifications.quietHours.enabled}
              onCheckedChange={(checked) =>
                setNotifications({
                  ...notifications,
                  quietHours: { ...notifications.quietHours, enabled: checked },
                })
              }
            />
          </div>

          {notifications.quietHours.enabled && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Select
                  value={notifications.quietHours.start}
                  onValueChange={(value) =>
                    setNotifications({
                      ...notifications,
                      quietHours: { ...notifications.quietHours, start: value },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, "0")
                      return (
                        <SelectItem key={hour} value={`${hour}:00`}>
                          {hour}:00
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-time">End Time</Label>
                <Select
                  value={notifications.quietHours.end}
                  onValueChange={(value) =>
                    setNotifications({
                      ...notifications,
                      quietHours: { ...notifications.quietHours, end: value },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, "0")
                      return (
                        <SelectItem key={hour} value={`${hour}:00`}>
                          {hour}:00
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
