"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, Eye, Flag, Download, MapPin, Calendar, Star, Loader2, AlertCircle, X } from "lucide-react"
import { auditService, AuditSummaryDto, AuditStats } from "@/lib/audit-service"
import { useAuth } from "@/lib/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AuditDetail } from "@/components/audit-detail"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function Audits() {
  const [searchTerm, setSearchTerm] = useState("")
  const [audits, setAudits] = useState<AuditSummaryDto[]>([])
  const [filteredAudits, setFilteredAudits] = useState<AuditSummaryDto[]>([])
  const [stats, setStats] = useState<AuditStats>({
    total: 0,
    completed: 0,
    inProgress: 0,
    flagged: 0,
    averageScore: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [showFilters, setShowFilters] = useState(false)
  const { user, logout } = useAuth()
  const token = user?.token

  // Fetch audits on component mount
  useEffect(() => {
    console.log('Audits component mounted, token:', !!token, 'user:', !!user)
    if (token) {
      fetchAudits()
    } else {
      console.log('No token available, setting loading to false')
      setLoading(false)
    }
  }, [token])

  // Filter audits when search term or filters change
  useEffect(() => {
    let filtered = audits.filter(
      (audit) =>
        (audit.templateName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (audit.auditorName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (audit.auditId.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    )

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(audit => audit.status === statusFilter)
    }

    setFilteredAudits(filtered)
  }, [audits, searchTerm, statusFilter])

  const fetchAudits = async () => {
    if (!token) {
      console.log('No token available for fetchAudits')
      setLoading(false)
      return
    }

    console.log('Fetching audits with token:', token.substring(0, 20) + '...')
    setLoading(true)
    setError(null)

    try {
      const [auditsData, statsData] = await Promise.all([
        auditService.getAudits(token, logout),
        auditService.getAuditStats(token, undefined, logout)
      ])

      console.log('Audits data received:', auditsData?.length || 0, 'audits')
      console.log('Stats data received:', statsData)

      setAudits(auditsData || [])
      setStats(statsData || {
        total: 0,
        completed: 0,
        inProgress: 0,
        flagged: 0,
        averageScore: 0
      })
    } catch (err) {
      console.error('Error fetching audits:', err)
      
      // Show mock data if API is not available (for development/testing)
      if (err instanceof Error && err.message.includes('fetch')) {
        console.log('API not available, showing mock data')
        const mockAudits: AuditSummaryDto[] = [
          {
            auditId: "AUD-001",
            templateId: "template-1",
            templateName: "Store Compliance Check",
            auditorName: "Rajesh Kumar",
            organisationName: "Test Organization",
            status: "Completed",
            score: 92,
            criticalIssues: 2,
            isFlagged: false,
            createdAt: "2025-01-14T14:30:00Z"
          },
          {
            auditId: "AUD-002",
            templateId: "template-2",
            templateName: "Product Display Audit",
            auditorName: "Priya Sharma",
            organisationName: "Test Organization",
            status: "In Progress",
            score: undefined,
            criticalIssues: 0,
            isFlagged: false,
            createdAt: "2025-01-15T10:15:00Z"
          },
          {
            auditId: "AUD-003",
            templateId: "template-3",
            templateName: "Inventory Check",
            auditorName: "Amit Singh",
            organisationName: "Test Organization",
            status: "Flagged",
            score: 65,
            criticalIssues: 5,
            isFlagged: true,
            createdAt: "2025-01-13T16:15:00Z"
          }
        ]
        
        setAudits(mockAudits)
        setStats({
          total: 3,
          completed: 1,
          inProgress: 1,
          flagged: 1,
          averageScore: 79
        })
        setError('API not available. Showing mock data for demonstration.')
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch audits')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    if (!token) return

    setExporting(true)
    try {
      // In a real implementation, this would call an export endpoint
      // For now, we'll simulate the export
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Create and download CSV
      const csvContent = [
        ['Audit ID', 'Template', 'Auditor', 'Status', 'Score', 'Critical Issues', 'Created Date'],
        ...filteredAudits.map(audit => [
          audit.auditId,
          audit.templateName || '',
          audit.auditorName || '',
          audit.status || '',
          audit.score?.toString() || '',
          audit.criticalIssues.toString(),
          auditService.formatDate(audit.createdAt)
        ])
      ].map(row => row.join(',')).join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audits-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error exporting audits:', err)
      setError('Failed to export audits')
    } finally {
      setExporting(false)
    }
  }

  const handleViewAudit = (auditId: string) => {
    setSelectedAuditId(auditId)
  }

  const handleCloseAuditDetail = () => {
    setSelectedAuditId(null)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("")
  }

  const getStatusColor = (status: string) => {
    return auditService.getStatusColor(status)
  }

  const getScoreColor = (score: number) => {
    return auditService.getScoreColor(score)
  }

  // Show authentication message if not logged in
  if (!user) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Audits</h2>
            <p className="text-gray-600">View and manage audit submissions</p>
          </div>
        </div>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please log in to view audits. You need to be authenticated to access this page.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Audits</h2>
            <p className="text-gray-600">View and manage audit submissions</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading audits...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Audits</h2>
          <p className="text-gray-600">View and manage audit submissions</p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleExport}
          disabled={exporting || filteredAudits.length === 0}
        >
          {exporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          {exporting ? 'Exporting...' : 'Export'}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Audits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? `${Math.round((stats.completed / stats.total) * 100)}% completion rate` : 'No audits yet'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? `${Math.round((stats.completed / stats.total) * 100)}% completion rate` : 'No completed audits'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.flagged}</div>
            <p className="text-xs text-muted-foreground">
              {stats.flagged > 0 ? 'Requires attention' : 'No flagged audits'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.averageScore > 0 ? 'Overall performance' : 'No scores yet'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
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
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium">Filters</h3>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All statuses</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Flagged">Flagged</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Filters */}
        {(searchTerm || statusFilter) && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Active filters:</span>
            {searchTerm && (
              <Badge variant="secondary" className="gap-1">
                Search: "{searchTerm}"
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchTerm("")} />
              </Badge>
            )}
            {statusFilter && (
              <Badge variant="secondary" className="gap-1">
                Status: {statusFilter}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setStatusFilter("")} />
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Audits Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Audits</CardTitle>
          <CardDescription>{filteredAudits.length} audits found</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAudits.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No audits match your search criteria' : 'No audits found'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Audit ID</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Auditor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Critical Issues</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAudits.map((audit) => (
                  <TableRow key={audit.auditId}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {audit.isFlagged && <Flag className="h-4 w-4 text-red-500" />}
                        {audit.auditId}
                      </div>
                    </TableCell>
                    <TableCell>{audit.templateName || 'Unknown Template'}</TableCell>
                    <TableCell>{audit.auditorName || 'Unknown Auditor'}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(audit.status || '')}>
                        {audit.status || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {audit.score ? (
                        <div className="flex items-center gap-1">
                          <Star className={`h-4 w-4 ${getScoreColor(audit.score)}`} />
                          <span className={`font-medium ${getScoreColor(audit.score)}`}>
                            {Math.round(audit.score)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {audit.criticalIssues > 0 ? (
                        <Badge variant="destructive" className="text-xs">
                          {audit.criticalIssues}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          {auditService.formatDate(audit.createdAt)}
                        </div>
                        <div className="text-gray-500">
                          {auditService.formatTime(audit.createdAt)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewAudit(audit.auditId)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Audit Detail Dialog */}
      <Dialog open={!!selectedAuditId} onOpenChange={(open) => !open && handleCloseAuditDetail()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Audit Details</DialogTitle>
          </DialogHeader>
          {selectedAuditId && (
            <AuditDetail 
              auditId={selectedAuditId} 
              onBack={handleCloseAuditDetail}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
