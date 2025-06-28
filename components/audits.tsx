"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, Eye, Flag, Download, MapPin, Calendar, Star } from "lucide-react"

export function Audits() {
  const [searchTerm, setSearchTerm] = useState("")

  const audits = [
    {
      id: "AUD-001",
      template: "Store Compliance Check",
      auditor: "Rajesh Kumar",
      store: "Metro Store - Downtown",
      location: "123 Main Street, Delhi",
      status: "Completed",
      score: 92,
      flagged: false,
      submittedDate: "2025-01-14",
      submittedTime: "2:30 PM",
      issues: 2,
    },
    {
      id: "AUD-002",
      template: "Product Display Audit",
      auditor: "Priya Sharma",
      store: "SuperMart - Mall Road",
      location: "456 Mall Road, Delhi",
      status: "In Progress",
      score: null,
      flagged: false,
      submittedDate: null,
      submittedTime: null,
      issues: 0,
    },
    {
      id: "AUD-003",
      template: "Inventory Check",
      auditor: "Amit Singh",
      store: "Quick Shop - Station",
      location: "789 Station Road, Delhi",
      status: "Flagged",
      score: 65,
      flagged: true,
      submittedDate: "2025-01-13",
      submittedTime: "4:15 PM",
      issues: 5,
    },
    {
      id: "AUD-004",
      template: "Customer Service Evaluation",
      auditor: "Neha Patel",
      store: "Big Bazaar - Central",
      location: "321 Central Avenue, Delhi",
      status: "Completed",
      score: 88,
      flagged: false,
      submittedDate: "2025-01-12",
      submittedTime: "11:45 AM",
      issues: 1,
    },
  ]

  const filteredAudits = audits.filter(
    (audit) =>
      audit.store.toLowerCase().includes(searchTerm.toLowerCase()) ||
      audit.auditor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      audit.template.toLowerCase().includes(searchTerm.toLowerCase()) ||
      audit.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 75) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Audits</h2>
          <p className="text-gray-600">View and manage audit submissions</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Audits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">+12 from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">91% completion rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">84%</div>
            <p className="text-xs text-muted-foreground">+3% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search audits..."
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

      {/* Audits Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Audits</CardTitle>
          <CardDescription>{filteredAudits.length} audits found</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Audit ID</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Auditor</TableHead>
                <TableHead>Store</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Issues</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAudits.map((audit) => (
                <TableRow key={audit.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {audit.flagged && <Flag className="h-4 w-4 text-red-500" />}
                      {audit.id}
                    </div>
                  </TableCell>
                  <TableCell>{audit.template}</TableCell>
                  <TableCell>{audit.auditor}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{audit.store}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {audit.location}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(audit.status)}>{audit.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {audit.score ? (
                      <div className="flex items-center gap-1">
                        <Star className={`h-4 w-4 ${getScoreColor(audit.score)}`} />
                        <span className={`font-medium ${getScoreColor(audit.score)}`}>{audit.score}%</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {audit.issues > 0 ? (
                      <Badge variant="destructive" className="text-xs">
                        {audit.issues}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">None</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {audit.submittedDate ? (
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          {audit.submittedDate}
                        </div>
                        <div className="text-gray-500">{audit.submittedTime}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">Pending</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
