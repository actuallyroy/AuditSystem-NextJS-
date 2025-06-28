"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Users, CheckSquare, AlertTriangle, TrendingUp, Calendar, MapPin, Clock } from "lucide-react"

interface DashboardProps {
  userRole: "admin" | "manager" | "supervisor"
}

export function Dashboard({ userRole }: DashboardProps) {
  const recentAudits = [
    {
      id: "AUD-001",
      store: "Metro Store - Downtown",
      auditor: "Rajesh Kumar",
      status: "Completed",
      score: 92,
      date: "2025-01-14",
    },
    {
      id: "AUD-002",
      store: "SuperMart - Mall Road",
      auditor: "Priya Sharma",
      status: "In Progress",
      score: null,
      date: "2025-01-14",
    },
    {
      id: "AUD-003",
      store: "Quick Shop - Station",
      auditor: "Amit Singh",
      status: "Flagged",
      score: 65,
      date: "2025-01-13",
    },
  ]

  const upcomingAssignments = [
    {
      id: "ASG-001",
      template: "Store Compliance Check",
      auditor: "Neha Patel",
      store: "Big Bazaar - Central",
      dueDate: "2025-01-15",
      priority: "High",
    },
    {
      id: "ASG-002",
      template: "Product Display Audit",
      auditor: "Vikram Singh",
      store: "Reliance Fresh - North",
      dueDate: "2025-01-16",
      priority: "Medium",
    },
  ]

  const regionalData = [
    { region: "North Delhi", completed: 85, total: 100 },
    { region: "South Delhi", completed: 92, total: 110 },
    { region: "East Delhi", completed: 78, total: 95 },
    { region: "West Delhi", completed: 88, total: 105 },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "default"
      case "In Progress":
        return "secondary"
      case "Flagged":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "destructive"
      case "Medium":
        return "default"
      case "Low":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600">Welcome back! Here's what's happening with your audits.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Audits</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89%</div>
            <p className="text-xs text-muted-foreground">+3% from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">-5 from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Auditors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">+2 new this week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Audits */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Audits</CardTitle>
            <CardDescription>Latest audit submissions and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAudits.map((audit) => (
                <div key={audit.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{audit.id}</span>
                      <Badge variant={getStatusColor(audit.status)}>{audit.status}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{audit.store}</p>
                    <p className="text-xs text-gray-500">by {audit.auditor}</p>
                  </div>
                  <div className="text-right">
                    {audit.score && <div className="text-lg font-semibold text-green-600">{audit.score}%</div>}
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {audit.date}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4 bg-transparent">
              View All Audits
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Assignments */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Assignments</CardTitle>
            <CardDescription>Scheduled audits and their deadlines</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAssignments.map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{assignment.template}</span>
                      <Badge variant={getPriorityColor(assignment.priority)}>{assignment.priority}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{assignment.store}</p>
                    <p className="text-xs text-gray-500">Assigned to {assignment.auditor}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Due {assignment.dueDate}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4 bg-transparent">
              View All Assignments
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Regional Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Regional Performance</CardTitle>
          <CardDescription>Audit completion rates by region</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {regionalData.map((region) => {
              const percentage = Math.round((region.completed / region.total) * 100)
              return (
                <div key={region.region} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{region.region}</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {region.completed}/{region.total} ({percentage}%)
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
