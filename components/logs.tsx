"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Filter, Activity, User, FileText, Settings, AlertTriangle, CheckCircle, Clock } from "lucide-react"

export function Logs() {
  const [searchTerm, setSearchTerm] = useState("")

  const logs = [
    {
      id: "LOG-001",
      action: "Audit Submitted",
      description: "Store Compliance Check audit submitted for Metro Store - Downtown",
      user: "Rajesh Kumar",
      userRole: "Auditor",
      timestamp: "2025-01-14 14:30:25",
      type: "audit",
      status: "success",
      details: "Audit ID: AUD-001, Score: 92%",
    },
    {
      id: "LOG-002",
      action: "Template Created",
      description: "New audit template 'Customer Service Evaluation' created",
      user: "Vikram Joshi",
      userRole: "Manager",
      timestamp: "2025-01-14 11:15:10",
      type: "template",
      status: "success",
      details: "Template ID: TPL-005, 6 sections, 30 questions",
    },
    {
      id: "LOG-003",
      action: "User Login",
      description: "User logged into the system",
      user: "Priya Sharma",
      userRole: "Auditor",
      timestamp: "2025-01-14 09:45:33",
      type: "auth",
      status: "success",
      details: "IP: 192.168.1.100, Device: Mobile",
    },
    {
      id: "LOG-004",
      action: "Assignment Created",
      description: "New audit assignment created for Big Bazaar - Central",
      user: "Neha Patel",
      userRole: "Supervisor",
      timestamp: "2025-01-14 08:20:15",
      type: "assignment",
      status: "success",
      details: "Assignment ID: ASG-005, Due: 2025-01-16",
    },
    {
      id: "LOG-005",
      action: "Failed Login Attempt",
      description: "Multiple failed login attempts detected",
      user: "Unknown",
      userRole: "N/A",
      timestamp: "2025-01-13 23:45:12",
      type: "security",
      status: "warning",
      details: "IP: 203.0.113.1, Attempts: 5",
    },
    {
      id: "LOG-006",
      action: "Report Generated",
      description: "Weekly compliance report generated and downloaded",
      user: "Admin User",
      userRole: "Admin",
      timestamp: "2025-01-13 16:30:00",
      type: "report",
      status: "success",
      details: "Report: Compliance, Format: PDF, Size: 2.4MB",
    },
    {
      id: "LOG-007",
      action: "User Deactivated",
      description: "User account deactivated due to inactivity",
      user: "Admin User",
      userRole: "Admin",
      timestamp: "2025-01-13 14:15:45",
      type: "user",
      status: "info",
      details: "User: john.doe@company.com, Reason: 30 days inactive",
    },
    {
      id: "LOG-008",
      action: "System Error",
      description: "Database connection timeout during audit submission",
      user: "System",
      userRole: "System",
      timestamp: "2025-01-13 12:05:30",
      type: "system",
      status: "error",
      details: "Error: Connection timeout, Duration: 30s",
    },
  ]

  const filteredLogs = logs.filter(
    (log) =>
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getActionIcon = (type: string) => {
    switch (type) {
      case "audit":
        return CheckCircle
      case "template":
        return FileText
      case "auth":
        return User
      case "assignment":
        return Activity
      case "security":
        return AlertTriangle
      case "report":
        return FileText
      case "user":
        return User
      case "system":
        return Settings
      default:
        return Activity
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "default"
      case "warning":
        return "secondary"
      case "error":
        return "destructive"
      case "info":
        return "outline"
      default:
        return "outline"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return CheckCircle
      case "warning":
        return AlertTriangle
      case "error":
        return AlertTriangle
      case "info":
        return Activity
      default:
        return Activity
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Logs</h2>
          <p className="text-gray-600">Monitor system activities and user actions</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.filter((l) => l.status === "success").length}</div>
            <p className="text-xs text-muted-foreground">Operations completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.filter((l) => l.status === "warning").length}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.filter((l) => l.status === "error").length}</div>
            <p className="text-xs text-muted-foreground">System errors</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Feed</CardTitle>
          <CardDescription>{filteredLogs.length} activities found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLogs.map((log) => {
              const ActionIcon = getActionIcon(log.type)
              const StatusIcon = getStatusIcon(log.status)

              return (
                <div key={log.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <ActionIcon className="h-5 w-5 text-gray-600" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900">{log.action}</h4>
                        <Badge variant={getStatusColor(log.status)} className="text-xs">
                          {log.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        {log.timestamp}
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mt-1">{log.description}</p>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src="/placeholder.svg" />
                          <AvatarFallback className="text-xs">
                            {log.user
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-600">
                          {log.user} ({log.userRole})
                        </span>
                      </div>

                      {log.details && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{log.details}</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
