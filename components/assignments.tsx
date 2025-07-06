"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Filter, Calendar, MapPin, User, Clock, Loader2, AlertCircle, CheckCircle, RefreshCw, FileText } from "lucide-react"
import { CreateAssignmentDialog } from "@/components/create-assignment-dialog"
import { useAuth } from "@/lib/auth-context"
import { assignmentService, Assignment, AssignmentStats, StoreInfo } from "@/lib/assignment-service"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AssignmentsProps {
  userRole?: "admin" | "manager" | "supervisor" | "auditor"
  setActiveView?: (view: string) => void
}

export function Assignments({ userRole, setActiveView }: AssignmentsProps) {
  const { user, userDetails, handleTokenExpiration } = useAuth()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [stats, setStats] = useState<AssignmentStats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
    cancelled: 0,
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Load assignments data
  const loadAssignments = async (showLoader = true) => {
    if (!user?.token) return

    try {
      if (showLoader) {
        setIsLoading(true)
      } else {
        setIsRefreshing(true)
      }
      setError(null)

      let assignmentsData: Assignment[]

      // Determine which assignments to load based on user role
      if (userRole === "auditor") {
        // Auditors see only their assignments
        assignmentsData = await assignmentService.getMyAssignments(user.token, handleTokenExpiration)
      } else {
        // Admins, managers, supervisors see all assignments in their organization
        assignmentsData = await assignmentService.getAssignments(
          user.token,
          userDetails?.organisationId,
          handleTokenExpiration
        )
      }

      setAssignments(assignmentsData)

      // Calculate stats
      const statsData = await assignmentService.getAssignmentStats(
        user.token,
        userDetails?.organisationId,
        handleTokenExpiration
      )
      setStats(statsData)

    } catch (err) {
      console.error("Error loading assignments:", err)
      setError(err instanceof Error ? err.message : "Failed to load assignments")
      
      // Fallback data for development
      setAssignments([])
      setStats({
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        overdue: 0,
        cancelled: 0,
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Load data on component mount and when dependencies change
  useEffect(() => {
    if (user?.token) {
      loadAssignments()
    }
  }, [user?.token, userDetails?.organisationId, userRole])

  // Helper functions to extract data from nested objects
  const getTemplateName = (assignment: Assignment) => {
    return assignment.template?.name || assignment.templateName || 'Unknown Template'
  }

  const getAssignedToName = (assignment: Assignment) => {
    if (assignment.assignedTo) {
      return `${assignment.assignedTo.firstName} ${assignment.assignedTo.lastName}`.trim()
    }
    return assignment.assignedToName || 'Unknown Auditor'
  }

  // Filter assignments based on search term and filters
  const filteredAssignments = assignments.filter((assignment) => {
    const storeInfo = assignmentService.parseStoreInfo(assignment.storeInfo)
    const templateName = getTemplateName(assignment)
    const assignedToName = getAssignedToName(assignment)
    
    const matchesSearch = 
      storeInfo.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignedToName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      templateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.assignmentId.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || assignment.status === statusFilter
    const matchesPriority = priorityFilter === "all" || assignment.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary"
      case "in_progress":
        return "default"
      case "completed":
      case "fulfilled":
        return "outline"
      case "cancelled":
        return "destructive"
      case "expired":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending"
      case "in_progress":
        return "In Progress"
      case "completed":
        return "Completed"
      case "fulfilled":
        return "Fulfilled"
      case "cancelled":
        return "Cancelled"
      case "expired":
        return "Expired"
      default:
        return status
    }
  }

  const getPriorityDisplay = (priority: string) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1)
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return dateString
    }
  }

  const isOverdue = (assignment: Assignment) => {
    const dueDate = new Date(assignment.dueDate)
    const now = new Date()
    return assignment.status === "pending" && dueDate < now
  }

  const handleAssignmentCreated = () => {
    // Refresh assignments after creating a new one
    loadAssignments(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading assignments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Assignments</h2>
          <p className="text-gray-600">
            {userRole === "auditor" 
              ? "View your assigned audits and schedules" 
              : "Manage audit assignments and schedules"
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => loadAssignments(false)}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {(userRole === "admin" || userRole === "manager" || userRole === "supervisor") && (
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Assignment
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2"
              onClick={() => loadAssignments()}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All assignments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting start</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Successfully finished</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search assignments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Assignments Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {userRole === "auditor" ? "My Assignments" : "All Assignments"}
          </CardTitle>
          <CardDescription>
            {filteredAssignments.length} assignment{filteredAssignments.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAssignments.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || statusFilter !== "all" || priorityFilter !== "all"
                  ? "No Matching Assignments"
                  : "No Assignments Yet"
                }
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== "all" || priorityFilter !== "all"
                  ? "No assignments match your current filters. Try adjusting your search or filters."
                  : userRole === "auditor" 
                    ? "You don't have any assignments yet. Check back later or contact your manager."
                    : "Get started by creating your first assignment."
                }
              </p>
              
              {/* Show action buttons only if not filtered and user has permission */}
              {!(searchTerm || statusFilter !== "all" || priorityFilter !== "all") && 
               (userRole === "admin" || userRole === "manager" || userRole === "supervisor") && (
                <div className="flex flex-col items-center gap-4">
                  <div className="flex gap-3">
                    <Button onClick={() => setShowCreateDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Assignment
                    </Button>
                    {setActiveView && (
                      <Button variant="outline" onClick={() => setActiveView('templates')}>
                        <FileText className="h-4 w-4 mr-2" />
                        Manage Templates
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    Need templates first? Create audit templates to assign to your team.
                  </p>
                </div>
              )}
              
              {/* Show clear filters button if filtered */}
              {(searchTerm || statusFilter !== "all" || priorityFilter !== "all") && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("")
                    setStatusFilter("all")
                    setPriorityFilter("all")
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Assignment</TableHead>
                  <TableHead>Auditor</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.map((assignment) => {
                  const storeInfo = assignmentService.parseStoreInfo(assignment.storeInfo)
                  const overdue = isOverdue(assignment)
                  const templateName = getTemplateName(assignment)
                  const assignedToName = getAssignedToName(assignment)
                  
                  return (
                    <TableRow key={assignment.assignmentId} className={overdue ? "bg-red-50" : ""}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{templateName}</div>
                          <div className="text-sm text-gray-500">{assignment.assignmentId}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          {assignedToName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{storeInfo.storeName}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {storeInfo.storeAddress}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusColor(assignment.status)}>
                            {getStatusDisplay(assignment.status)}
                          </Badge>
                          {overdue && (
                            <Badge variant="destructive" className="text-xs">
                              Overdue
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPriorityColor(assignment.priority)}>
                          {getPriorityDisplay(assignment.priority)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          {formatDate(assignment.dueDate)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="h-3 w-3" />
                          {formatDate(assignment.createdAt)}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CreateAssignmentDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog}
        onAssignmentCreated={handleAssignmentCreated}
        setActiveView={setActiveView}
      />
    </div>
  )
}
