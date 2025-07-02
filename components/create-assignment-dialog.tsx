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
import { organizationService, OrganizationMember } from "@/lib/organization-service"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

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
  const [auditors, setAuditors] = useState<OrganizationMember[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load templates and auditors when dialog opens
  useEffect(() => {
    if (open && user?.token && userDetails?.organisationId) {
      loadData()
    }
  }, [open, user?.token, userDetails?.organisationId])

  const loadData = async () => {
    if (!user?.token || !userDetails?.organisationId) return

    try {
      setIsLoading(true)
      setError(null)

      const [templatesData, membersData] = await Promise.all([
        templateService.getTemplates(user.token),
        organizationService.getOrganizationMembers(userDetails.organisationId, user.token)
      ])

      setTemplates(templatesData)
      
      // Filter members to only include auditors
      const auditorMembers = membersData.filter(member => 
        member.role === 'auditor' && member.status === 'active'
      )
      setAuditors(auditorMembers)

    } catch (err) {
      console.error("Error loading data:", err)
      setError(err instanceof Error ? err.message : "Failed to load data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.token || !userDetails?.organisationId) {
      setError("Authentication required")
      return
    }

    if (!formData.templateId || !formData.assignedToId || !formData.storeName || 
        !formData.storeAddress || !formData.dueDate || !formData.priority) {
      setError("Please fill in all required fields")
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      const storeInfo = {
        storeName: formData.storeName,
        storeAddress: formData.storeAddress,
      }

      const assignmentData: CreateAssignmentRequest = {
        templateId: formData.templateId,
        assignedToId: formData.assignedToId,
        organisationId: userDetails.organisationId,
        dueDate: new Date(formData.dueDate).toISOString(),
        priority: formData.priority as 'low' | 'medium' | 'high',
        notes: formData.notes || undefined,
        storeInfo: assignmentService.formatStoreInfo(storeInfo),
      }

      await assignmentService.createAssignment(assignmentData, user.token)
      
      // Success - close dialog and reset form
      onOpenChange(false)
      resetForm()
      
      // Notify parent component
      if (onAssignmentCreated) {
        onAssignmentCreated()
      }

    } catch (err) {
      console.error("Error creating assignment:", err)
      setError(err instanceof Error ? err.message : "Failed to create assignment")
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
      <DialogContent className="sm:max-w-[500px]">
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
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template.templateId} value={template.templateId}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="auditor">Auditor *</Label>
                    <Select
                      value={formData.assignedToId}
                      onValueChange={(value) => setFormData({ ...formData, assignedToId: value })}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select auditor" />
                      </SelectTrigger>
                      <SelectContent>
                        {auditors.map((auditor) => (
                          <SelectItem key={auditor.userId} value={auditor.userId}>
                            {auditor.firstName} {auditor.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
              disabled={isLoading || isSubmitting}
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
