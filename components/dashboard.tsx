"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Users, CheckSquare, AlertTriangle, TrendingUp, Calendar, MapPin, Clock, RefreshCw } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { dashboardService, DashboardResponse, DashboardStats, RecentAuditDto, UpcomingAssignmentDto } from "@/lib/dashboard-service"
import { toast } from "@/hooks/use-toast"

interface DashboardProps {
  userRole: "admin" | "manager" | "supervisor" | "auditor"
}

export function Dashboard({ userRole }: DashboardProps) {
  const { user, userDetails, handleTokenExpiration } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch dashboard data
  const fetchDashboardData = async (isRefresh = false) => {
    if (!user?.token) {
      setError("No authentication token found")
      setIsLoading(false)
      return
    }

    try {
      if (isRefresh) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }
      setError(null)

      // Use the general dashboard endpoint for all users
      const response = await dashboardService.getDashboard(
        user.token,
        handleTokenExpiration
      )

      setDashboardData(response)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch dashboard data"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData()
  }, [user?.token])

  // Refresh dashboard data
  const handleRefresh = () => {
    fetchDashboardData(true)
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "default"
      case "in progress":
      case "in_progress":
        return "secondary"
      case "flagged":
      case "rejected":
        return "destructive"
      case "pending":
        return "outline"
      default:
        return "outline"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "outline"
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-red-600">Error loading dashboard: {error}</p>
        </div>
        <Button onClick={handleRefresh} disabled={isRefreshing}>
          {isRefreshing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </>
          )}
        </Button>
      </div>
    )
  }

  // Default data if API doesn't return data
  const stats: DashboardStats = dashboardData?.stats || {
    totalAudits: 0,
    completionRate: 0,
    criticalIssues: 0,
    activeAuditors: 0,
  }

  const recentAudits: RecentAuditDto[] = dashboardData?.recentAudits || []
  const upcomingAssignments: UpcomingAssignmentDto[] = dashboardData?.upcomingAssignments || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600">Welcome back! Here's what's happening with your audits.</p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={isRefreshing}
          variant="outline"
          size="sm"
        >
          {isRefreshing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </>
          )}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Audits</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAudits.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalAuditsChange ? `${stats.totalAuditsChange} from last month` : "No change data"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.completionRateChange ? `${stats.completionRateChange} from last week` : "No change data"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.criticalIssues}</div>
            <p className="text-xs text-muted-foreground">
              {stats.criticalIssuesChange ? `${stats.criticalIssuesChange} from yesterday` : "No change data"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Auditors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeAuditors}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeAuditorsChange ? `${stats.activeAuditorsChange} new this week` : "No change data"}
            </p>
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
            {recentAudits.length > 0 ? (
              <div className="space-y-4">
                {recentAudits.map((audit, index) => (
                  <div key={audit.id || index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{audit.id || `AUD-${index + 1}`}</span>
                        <Badge variant={getStatusColor(audit.status || "")}>
                          {audit.status || "Unknown"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{audit.store || "Store not specified"}</p>
                      <p className="text-xs text-gray-500">by {audit.auditor || "Unknown auditor"}</p>
                    </div>
                    <div className="text-right">
                      {audit.score !== undefined && (
                        <div className="text-lg font-semibold text-green-600">{audit.score}%</div>
                      )}
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {audit.date || "Date not available"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No recent audits found</p>
              </div>
            )}
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
            {upcomingAssignments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAssignments.map((assignment, index) => (
                  <div key={assignment.id || index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{assignment.template || "Template not specified"}</span>
                        <Badge variant={getPriorityColor(assignment.priority || "")}>
                          {assignment.priority || "No priority"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{assignment.store || "Store not specified"}</p>
                      <p className="text-xs text-gray-500">Assigned to {assignment.auditor || "Unknown auditor"}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Due {assignment.dueDate || "Date not available"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No upcoming assignments</p>
              </div>
            )}
            <Button variant="outline" className="w-full mt-4 bg-transparent">
              View All Assignments
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Regional Performance - Commented out as requested */}
      {/*
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
      */}
    </div>
  )
}
