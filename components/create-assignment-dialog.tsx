"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/auth-context"
import { assignmentService, CreateAssignmentRequest } from "@/lib/assignment-service"
import { templateService, Template } from "@/lib/template-service"
import { Loader2, AlertCircle, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// User interface for auditors (from Users API)
interface User {
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  organisationId: string;
  createdAt: string;
}

interface CreateAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAssignmentCreated?: () => void
}

export function CreateAssignmentDialog({ open, onOpenChange, onAssignmentCreated }: CreateAssignmentDialogProps) {
  const { user, userDetails } = useAuth()
  const [formData, setFormData] = useState({
    templateId: "",
    assignedToId: "",
    storeName: "",
    storeAddress: "",
    dueDate: "",
    priority: "",
    notes: "",
  })
  const [templates, setTemplates] = useState<Template[]>([])
  const [auditors, setAuditors] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  // Add debug info
  const addDebugInfo = (info: string) => {
    console.log(`[CreateAssignment] ${info}`)
    setDebugInfo(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${info}`])
  }

  // Load templates and auditors when dialog opens
  useEffect(() => {
    if (open && user?.token && userDetails?.organisationId) {
      loadData()
    }
  }, [open, user?.token, userDetails?.organisationId])

  const loadData = async () => {
    if (!user?.token || !userDetails?.organisationId) {
      setError("Authentication required. Please login again.")
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      setDebugInfo([])
      
      addDebugInfo("Starting to load templates and users...")
      addDebugInfo(`Token available: ${!!user.token}, Org ID: ${userDetails.organisationId}`)

      // Load templates and users in parallel
      const [templatesResult, usersResult] = await Promise.allSettled([
        loadTemplates(),
        loadUsers()
      ])

      // Handle templates result
      if (templatesResult.status === 'fulfilled') {
        setTemplates(templatesResult.value)
        addDebugInfo(`Templates loaded successfully: ${templatesResult.value.length} templates`)
      } else {
        console.error("Templates loading failed:", templatesResult.reason)
        addDebugInfo(`Templates loading failed: ${templatesResult.reason?.message || 'Unknown error'}`)
      }

      // Handle users result
      if (usersResult.status === 'fulfilled') {
        setAuditors(usersResult.value)
        addDebugInfo(`Auditors loaded successfully: ${usersResult.value.length} auditors`)
      } else {
        console.error("Users loading failed:", usersResult.reason)
        addDebugInfo(`Users loading failed: ${usersResult.reason?.message || 'Unknown error'}`)
      }

      // Set error if both failed
      if (templatesResult.status === 'rejected' && usersResult.status === 'rejected') {
        setError("Failed to load both templates and auditors. Please check your connection and try again.")
      } else if (templatesResult.status === 'rejected') {
        setError("Failed to load templates. Assignment creation may be limited.")
      } else if (usersResult.status === 'rejected') {
        setError("Failed to load auditors. You can still create assignments but auditor selection may be limited.")
      }

    } catch (err) {
      console.error("Unexpected error loading data:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to load data"
      setError(`Unexpected error: ${errorMessage}`)
      addDebugInfo(`Unexpected error: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  const loadTemplates = async (): Promise<Template[]> => {
    if (!user?.token) throw new Error("No authentication token available")
    
    try {
      addDebugInfo("Fetching templates from API...")
      const templatesData = await templateService.getTemplates(user.token)
      
      if (!Array.isArray(templatesData)) {
        throw new Error("Invalid templates data format received from server")
      }
      
      addDebugInfo(`Templates API response: ${templatesData.length} templates`)
      
      // Filter only published or valid templates if needed
      const validTemplates = templatesData.filter(template => {
        // Add any validation logic here if needed
        return template.name && template.templateId
      })
      
      if (validTemplates.length !== templatesData.length) {
        addDebugInfo(`Filtered templates: ${validTemplates.length} valid out of ${templatesData.length}`)
      }
      
      return validTemplates
    } catch (err) {
      console.error("Error in loadTemplates:", err)
      addDebugInfo(`Template loading error: ${err instanceof Error ? err.message : 'Unknown error'}`)
      throw new Error(`Failed to load templates: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const loadUsers = async (): Promise<User[]> => {
    if (!user?.token || !userDetails?.organisationId) {
      throw new Error("Missing authentication token or organization ID")
    }
    
    try {
      addDebugInfo("Fetching users from API...")
      
      // Use the correct endpoint for getting users by organisation
      const response = await fetch(`http://localhost:8080/api/v1/Users/by-organisation/${userDetails.organisationId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
      })

      addDebugInfo(`Users API response status: ${response.status}`)

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
        } catch {
          // If parsing JSON fails, use status text
          errorMessage = response.statusText || errorMessage
        }
        
        if (response.status === 403) {
          throw new Error("Access denied. You may not have permission to view organization users.")
        } else if (response.status === 404) {
          throw new Error("Organization not found or users endpoint not available.")
        } else {
          throw new Error(`Failed to fetch users: ${errorMessage}`)
        }
      }

      const usersData = await response.json()
      addDebugInfo(`Users API returned: ${Array.isArray(usersData) ? usersData.length : 'invalid'} users`)

      if (!Array.isArray(usersData)) {
        throw new Error("Invalid users data format received from server")
      }

      // Filter for active auditors only
      const activeAuditors = usersData.filter((userItem: User) => {
        const isAuditor = userItem.role && userItem.role.toLowerCase() === 'auditor'
        const isActive = userItem.isActive === true
        return isAuditor && isActive
      })

      addDebugInfo(`Filtered auditors: ${activeAuditors.length} active auditors out of ${usersData.length} total users`)

      return activeAuditors
    } catch (err) {
      console.error("Error in loadUsers:", err)
      addDebugInfo(`Users loading error: ${err instanceof Error ? err.message : 'Unknown error'}`)
      throw new Error(`Failed to load users: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.token || !userDetails?.organisationId) {
      setError("Authentication required. Please login again.")
      return
    }

    // Validate required fields
    const requiredFields = {
      templateId: "Template",
      assignedToId: "Auditor",
      storeName: "Store Name",
      storeAddress: "Store Address",
      dueDate: "Due Date",
      priority: "Priority"
    }

    const missingFields = Object.entries(requiredFields)
      .filter(([key]) => !formData[key as keyof typeof formData])
      .map(([, label]) => label)

    if (missingFields.length > 0) {
      setError(`Please fill in the following required fields: ${missingFields.join(', ')}`)
      return
    }

    // Validate due date is not in the past
    const selectedDate = new Date(formData.dueDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (selectedDate < today) {
      setError("Due date cannot be in the past")
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      addDebugInfo("Creating assignment...")

      const storeInfo = {
        storeName: formData.storeName.trim(),
        storeAddress: formData.storeAddress.trim(),
      }

      const assignmentData: CreateAssignmentRequest = {
        templateId: formData.templateId,
        assignedToId: formData.assignedToId,
        organisationId: userDetails.organisationId,
        dueDate: new Date(formData.dueDate).toISOString(),
        priority: formData.priority as 'low' | 'medium' | 'high',
        notes: formData.notes.trim() || undefined,
        storeInfo: assignmentService.formatStoreInfo(storeInfo),
      }

      addDebugInfo("Calling assignment service...")
      await assignmentService.createAssignment(assignmentData, user.token)
      
      addDebugInfo("Assignment created successfully!")
      
      // Success - close dialog and reset form
      onOpenChange(false)
      resetForm()
      
      // Notify parent component
      if (onAssignmentCreated) {
        onAssignmentCreated()
      }

    } catch (err) {
      console.error("Error creating assignment:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to create assignment"
      setError(`Failed to create assignment: ${errorMessage}`)
      addDebugInfo(`Assignment creation failed: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      templateId: "",
      assignedToId: "",
      storeName: "",
      storeAddress: "",
      dueDate: "",
      priority: "",
      notes: "",
    })
    setError(null)
    setDebugInfo([])
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isSubmitting) {
      resetForm()
    }
    onOpenChange(newOpen)
  }

  // Get minimum date (today)
  const getMinDate = () => {
    return new Date().toISOString().split('T')[0]
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Assignment</DialogTitle>
          <DialogDescription>Assign an audit template to an auditor for a specific store.</DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Debug info for development */}
        {debugInfo.length > 0 && process.env.NODE_ENV === 'development' && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <details className="text-xs">
                <summary className="cursor-pointer font-medium">Debug Information</summary>
                <div className="mt-2 space-y-1">
                  {debugInfo.map((info, index) => (
                    <div key={index} className="font-mono text-xs">{info}</div>
                  ))}
                </div>
              </details>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading templates and auditors...</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="template">Template *</Label>
                    <Select
                      value={formData.templateId}
                      onValueChange={(value) => setFormData({ ...formData, templateId: value })}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={templates.length > 0 ? "Select template" : "No templates available"} />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.length > 0 ? (
                          templates.map((template) => (
                            <SelectItem key={template.templateId} value={template.templateId}>
                              {template.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="" disabled>No templates available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    {templates.length === 0 && (
                      <p className="text-xs text-gray-500">No templates found. Please create templates first.</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="auditor">Auditor *</Label>
                    <Select
                      value={formData.assignedToId}
                      onValueChange={(value) => setFormData({ ...formData, assignedToId: value })}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={auditors.length > 0 ? "Select auditor" : "No auditors available"} />
                      </SelectTrigger>
                      <SelectContent>
                        {auditors.length > 0 ? (
                          auditors.map((auditor) => (
                            <SelectItem key={auditor.userId} value={auditor.userId}>
                              {auditor.firstName} {auditor.lastName}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="" disabled>No active auditors available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    {auditors.length === 0 && (
                      <p className="text-xs text-gray-500">No active auditors found in your organization.</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeName">Store Name *</Label>
                  <Input
                    id="storeName"
                    value={formData.storeName}
                    onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                    placeholder="e.g., Metro Store - Downtown"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeAddress">Store Address *</Label>
                  <Input
                    id="storeAddress"
                    value={formData.storeAddress}
                    onChange={(e) => setFormData({ ...formData, storeAddress: e.target.value })}
                    placeholder="e.g., 123 Main Street, Delhi"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date *</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      min={getMinDate()}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority *</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => setFormData({ ...formData, priority: value })}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any special instructions or notes"
                    rows={3}
                    disabled={isSubmitting}
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || isSubmitting || templates.length === 0 || auditors.length === 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Assignment"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
