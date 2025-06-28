"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Filter, Calendar, MapPin, User, Clock } from "lucide-react"
import { CreateAssignmentDialog } from "@/components/create-assignment-dialog"

export function Assignments() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const assignments = [
    {
      id: "ASG-001",
      template: "Store Compliance Check",
      auditor: "Rajesh Kumar",
      store: "Metro Store - Downtown",
      location: "123 Main Street, Delhi",
      status: "Pending",
      priority: "High",
      dueDate: "2025-01-15",
      assignedDate: "2025-01-10",
      estimatedDuration: "2 hours",
    },
    {
      id: "ASG-002",
      template: "Product Display Audit",
      auditor: "Priya Sharma",
      store: "SuperMart - Mall Road",
      location: "456 Mall Road, Delhi",
      status: "In Progress",
      priority: "Medium",
      dueDate: "2025-01-16",
      assignedDate: "2025-01-11",
      estimatedDuration: "1.5 hours",
    },
    {
      id: "ASG-003",
      template: "Inventory Check",
      auditor: "Amit Singh",
      store: "Quick Shop - Station",
      location: "789 Station Road, Delhi",
      status: "Completed",
      priority: "Low",
      dueDate: "2025-01-13",
      assignedDate: "2025-01-08",
      estimatedDuration: "3 hours",
    },
    {
      id: "ASG-004",
      template: "Customer Service Evaluation",
      auditor: "Neha Patel",
      store: "Big Bazaar - Central",
      location: "321 Central Avenue, Delhi",
      status: "Overdue",
      priority: "High",
      dueDate: "2025-01-12",
      assignedDate: "2025-01-07",
      estimatedDuration: "2.5 hours",
    },
  ]

  const filteredAssignments = assignments.filter(
    (assignment) =>
      assignment.store.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.auditor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.template.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "secondary"
      case "In Progress":
        return "default"
      case "Completed":
        return "outline"
      case "Overdue":
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Assignments</h2>
          <p className="text-gray-600">Manage audit assignments and schedules</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Assignment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48</div>
            <p className="text-xs text-muted-foreground">+8 this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">25% of total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">33</div>
            <p className="text-xs text-muted-foreground">69% completion rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search assignments..."
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

      {/* Assignments Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Assignments</CardTitle>
          <CardDescription>{filteredAssignments.length} assignments found</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Assignment</TableHead>
                <TableHead>Auditor</TableHead>
                <TableHead>Store</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{assignment.template}</div>
                      <div className="text-sm text-gray-500">{assignment.id}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      {assignment.auditor}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{assignment.store}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {assignment.location}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(assignment.status)}>{assignment.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPriorityColor(assignment.priority)}>{assignment.priority}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      {assignment.dueDate}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="h-3 w-3 text-gray-400" />
                      {assignment.estimatedDuration}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CreateAssignmentDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
    </div>
  )
}
