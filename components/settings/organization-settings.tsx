"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Building,
  Users,
  UserCheck,
  UserX,
  MoreHorizontal,
  Search,
  Filter,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Edit,
  Save,
  X,
  Loader2,
  AlertTriangle,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { organizationService, type Organization, type OrganizationMember, type OrganizationWithData, type OrganizationAssignment } from "@/lib/organization-service"

interface OrganizationSettingsProps {
  userRole: "admin" | "manager" | "supervisor" | "auditor"
}

export function OrganizationSettings({ userRole }: OrganizationSettingsProps) {
  const { user, userDetails, handleTokenExpiration } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTab, setSelectedTab] = useState("details")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Organization type options
  const organizationTypes = [
    { value: "personal", label: "Personal"},
    { value: "retail_chain", label: "Retail Chain" },
    { value: "franchise", label: "Franchise" },
    { value: "independent_store", label: "Independent Store" },
    { value: "supermarket", label: "Supermarket" },
    { value: "convenience_store", label: "Convenience Store" },
    { value: "department_store", label: "Department Store" },
    { value: "specialty_store", label: "Specialty Store" },
    { value: "hypermarket", label: "Hypermarket" },
    { value: "warehouse_club", label: "Warehouse Club" },
    { value: "other", label: "Other" },
  ]
  
  // Organization data
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [isEditingOrg, setIsEditingOrg] = useState(false)
  const [orgFormData, setOrgFormData] = useState({
    name: "",
    region: "",
    type: "",
  })
  
  // Members data
  const [members, setMembers] = useState<OrganizationMember[]>([])
  const [assignments, setAssignments] = useState<OrganizationAssignment[]>([])
  const [audits, setAudits] = useState<any[]>([])
  
  // Dialog states
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const [selectedMember, setSelectedMember] = useState<OrganizationMember | null>(null)

  // Load data on component mount
  useEffect(() => {
    if (user?.token && userDetails?.organisationId) {
      loadOrganizationData()
    }
  }, [user?.token, userDetails?.organisationId])

  const loadOrganizationData = async () => {
    if (!user?.token || !userDetails?.organisationId) return

    setIsLoading(true)
    setError(null)

    try {
      console.log("Loading organization data for:", userDetails.organisationId)
      
      // Use the single API call to get all organization data
      const orgData = await organizationService.getOrganizationWithData(
        userDetails.organisationId,
        user.token,
        handleTokenExpiration
      )
      
      console.log("Complete organization data loaded:", orgData)
      
      // Set organization details
      setOrganization({
        organisationId: orgData.organisationId,
        name: orgData.name,
        region: orgData.region,
        type: orgData.type,
        createdAt: orgData.createdAt
      })
      
      setOrgFormData({
        name: orgData.name,
        region: orgData.region || "",
        type: orgData.type || "",
      })
      
      // Set members from users array
      const members = (orgData.users || []).map(user => ({
        userId: user.userId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.createdAt
      }))
      
      console.log("Members extracted:", members)
      setMembers(members)
      
      // Set assignments from top-level assignments array
      const assignments = orgData.assignments || []
      console.log("Assignments extracted:", assignments)
      setAssignments(assignments)
      
      // Clear any previous errors
      setError(null)
      
    } catch (err) {
      console.error("Error loading organization data:", err)
      setError(err instanceof Error ? err.message : "Failed to load organization data")
      
      // Set fallback data if API fails
      const fallbackOrg = {
        organisationId: userDetails.organisationId,
        name: "Your Organization",
        region: "",
        type: "retail_chain",
        createdAt: new Date().toISOString()
      }
      setOrganization(fallbackOrg)
      setOrgFormData({
        name: fallbackOrg.name,
        region: fallbackOrg.region,
        type: fallbackOrg.type,
      })
      setMembers([])
      setAssignments([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateOrganization = async () => {
    if (!user?.token || !userDetails?.organisationId) return

    try {
      setIsLoading(true)
      const updatedOrg = await organizationService.updateOrganization({
        organisationId: userDetails.organisationId,
        ...orgFormData,
      }, user.token)
      
      setOrganization(updatedOrg)
      setIsEditingOrg(false)
      setError(null)
    } catch (err) {
      console.error("Error updating organization:", err)
      setError(err instanceof Error ? err.message : "Failed to update organization")
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleUserStatus = async (member: OrganizationMember) => {
    if (!user?.token) return

    try {
      await organizationService.updateUserStatus(member.userId, !member.isActive, user.token)
      
      // Update local state
      setMembers(prev => prev.map(m => 
        m.userId === member.userId 
          ? { ...m, isActive: !m.isActive }
          : m
      ))
    } catch (err) {
      console.error("Error updating user status:", err)
      setError(err instanceof Error ? err.message : "Failed to update user status")
    }
  }

  const handleRemoveMember = async () => {
    if (!user?.token || !selectedMember) return

    try {
      await organizationService.removeUserFromOrganization(selectedMember.userId, user.token)
      
      // Update local state
      setMembers(prev => prev.filter(m => m.userId !== selectedMember.userId))
      setShowRemoveDialog(false)
      setSelectedMember(null)
    } catch (err) {
      console.error("Error removing member:", err)
      setError(err instanceof Error ? err.message : "Failed to remove member")
    }
  }

  const filteredMembers = members.filter(
    (member) =>
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string | boolean) => {
    if (typeof status === "boolean") {
      return status ? "default" : "secondary"
    }
    switch (status) {
      case "Active":
      case "Completed":
        return "default"
      case "Inactive":
      case "In Progress":
        return "secondary"
      case "Pending":
        return "outline"
      case "Flagged":
        return "destructive"
      default:
        return "outline"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Show loading state
  if (isLoading && !organization) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="text-gray-500">Loading organization data...</p>
        {/* Debug info */}
        <div className="text-xs text-gray-400 mt-4">
          <p>User token: {user?.token ? "✓" : "✗"}</p>
          <p>Organization ID: {userDetails?.organisationId || "Not found"}</p>
          <p>User details loaded: {userDetails ? "✓" : "✗"}</p>
        </div>
      </div>
    )
  }

  // Show error state if no organization data and not loading
  if (!isLoading && !organization && !error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <AlertTriangle className="h-12 w-12 text-orange-500" />
        <h3 className="text-lg font-medium text-gray-900">No Organization Data</h3>
        <p className="text-gray-500 text-center">
          Unable to load organization information. This might be because:
        </p>
        <ul className="text-sm text-gray-400 list-disc list-inside space-y-1">
          <li>Your account is not associated with an organization</li>
          <li>The organization API endpoints are not available</li>
          <li>You don't have permission to view this data</li>
        </ul>
        <Button onClick={loadOrganizationData} variant="outline" className="mt-4">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Organization Management
          </CardTitle>
          <CardDescription>Manage your organization details, members, and activities</CardDescription>
        </CardHeader>
      </Card>

      {error && (
        <Alert className="bg-red-50 text-red-900 border-red-200">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{members.length}</div>
                <div className="text-sm text-gray-600">Total Members</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{members.filter((m) => m.isActive).length}</div>
                <div className="text-sm text-gray-600">Active Members</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{assignments.length}</div>
                <div className="text-sm text-gray-600">Assignments</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Organization</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
        </TabsList>

        {/* Organization Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Organization Details</CardTitle>
                  <CardDescription>Manage your organization information</CardDescription>
                </div>
                {(userRole === "admin" || userRole === "manager") && (
                  <Button
                    variant={isEditingOrg ? "outline" : "default"}
                    onClick={() => {
                      if (isEditingOrg) {
                        // Cancel editing
                        setIsEditingOrg(false)
                        setOrgFormData({
                          name: organization?.name || "",
                          region: organization?.region || "",
                          type: organization?.type || "",
                        })
                      } else {
                        setIsEditingOrg(true)
                      }
                    }}
                  >
                    {isEditingOrg ? (
                      <>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {organization && (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="orgName">Organization Name</Label>
                      {isEditingOrg ? (
                        <Input
                          id="orgName"
                          value={orgFormData.name}
                          onChange={(e) => setOrgFormData({ ...orgFormData, name: e.target.value })}
                          placeholder="Enter organization name"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-md border">
                          {organization.name}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="orgRegion">Region</Label>
                      {isEditingOrg ? (
                        <Input
                          id="orgRegion"
                          value={orgFormData.region}
                          onChange={(e) => setOrgFormData({ ...orgFormData, region: e.target.value })}
                          placeholder="Enter region"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-md border">
                          {organization.region || "Not specified"}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="orgType">Organization Type</Label>
                      {isEditingOrg ? (
                        <Select
                          value={orgFormData.type}
                          onValueChange={(value) => setOrgFormData({ ...orgFormData, type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select organization type" defaultValue={orgFormData.type.toLowerCase().replace(/ /g, "_")} />
                          </SelectTrigger>
                          <SelectContent>
                            {organizationTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-md border">
                          {organizationTypes.find(type => type.value === organization.type)?.label || 
                           organization.type || "Not specified"}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Created Date</Label>
                      <div className="p-3 bg-gray-50 rounded-md border">
                        {formatDate(organization.createdAt)}
                      </div>
                    </div>
                  </div>

                  {isEditingOrg && (
                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleUpdateOrganization} disabled={isLoading}>
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save Changes
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search members..."
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

          <Card>
            <CardHeader>
              <CardTitle>Organization Members</CardTitle>
              <CardDescription>{filteredMembers.length} members found</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow key={member.userId}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src="/placeholder.svg" />
                            <AvatarFallback>
                              {member.firstName[0]}{member.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{member.firstName} {member.lastName}</div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {member.email}
                            </div>
                            {member.phone && (
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {member.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{member.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(member.isActive)}>
                          {member.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(member.createdAt)}</TableCell>
                      <TableCell>
                        {(userRole === "admin" || userRole === "manager") && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleToggleUserStatus(member)}>
                                {member.isActive ? (
                                  <>
                                    <UserX className="mr-2 h-4 w-4" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="mr-2 h-4 w-4" />
                                    Activate
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => {
                                  setSelectedMember(member)
                                  setShowRemoveDialog(true)
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove Member
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Organization Assignments</CardTitle>
              <CardDescription>View and manage audit assignments</CardDescription>
            </CardHeader>
            <CardContent>
              {assignments.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Assignments</h3>
                  <p className="text-gray-600">No assignments found for this organization.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Assignment ID</TableHead>
                      <TableHead>Auditor</TableHead>
                      <TableHead>Template</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.map((assignment) => {
                      // Extract template name from nested template object
                      const templateName = assignment.template?.name || 'Unknown Template'
                      
                      // Handle assignedTo and assignedBy - they are user objects, not strings
                      let assignedToName = 'Unknown Auditor'
                      if (assignment.assignedTo) {
                        if (typeof assignment.assignedTo === 'string') {
                          assignedToName = assignment.assignedTo
                        } else if (typeof assignment.assignedTo === 'object' && assignment.assignedTo.firstName && assignment.assignedTo.lastName) {
                          assignedToName = `${assignment.assignedTo.firstName} ${assignment.assignedTo.lastName}`.trim()
                        }
                      }
                      
                      let assignedByName = 'Unknown Manager'
                      if (assignment.assignedBy) {
                        if (typeof assignment.assignedBy === 'string') {
                          assignedByName = assignment.assignedBy
                        } else if (typeof assignment.assignedBy === 'object' && assignment.assignedBy.firstName && assignment.assignedBy.lastName) {
                          assignedByName = `${assignment.assignedBy.firstName} ${assignment.assignedBy.lastName}`.trim()
                        }
                      }
                      
                      return (
                        <TableRow key={assignment.assignmentId}>
                          <TableCell className="font-medium">{assignment.assignmentId}</TableCell>
                          <TableCell>{assignedToName}</TableCell>
                          <TableCell>{templateName}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(assignment.status)}>{assignment.status}</Badge>
                          </TableCell>
                          <TableCell>{formatDate(assignment.dueDate)}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>


      </Tabs>

      {/* Remove Member Dialog */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {selectedMember?.firstName} {selectedMember?.lastName} from the organization? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRemoveDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveMember}>
              Remove Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 
