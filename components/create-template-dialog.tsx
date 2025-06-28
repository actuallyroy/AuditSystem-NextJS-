"use client"

import React, { useState, useEffect } from "react"

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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { templateService } from "@/lib/template-service"
import { useRouter } from "next/navigation"

interface CreateTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateTemplateDialog({ open, onOpenChange }: CreateTemplateDialogProps) {
  const { user } = useAuth()
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    validFrom: "",
    validTo: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Generate default dates for validFrom (today) and validTo (1 year from today)
  const initializeDefaultDates = () => {
    const today = new Date()
    const nextYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate())
    
    return {
      validFrom: today.toISOString().split('T')[0],
      validTo: nextYear.toISOString().split('T')[0]
    }
  }

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      const defaultDates = initializeDefaultDates()
      setFormData({
        name: "",
        description: "",
        category: "",
        validFrom: defaultDates.validFrom,
        validTo: defaultDates.validTo,
      })
      setError(null)
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.token) {
      setError("You must be logged in to create templates")
      return
    }
    
    setIsLoading(true)
    setError(null)

    try {
      // Create empty template structure with one section and basic question
      const emptyTemplateQuestions = {
        sections: [
          {
            title: "Default Section",
            questions: [
              {
                id: "q1",
                text: "Sample Question",
                type: "yes_no",
                required: true
              }
            ]
          }
        ]
      }

      // Basic scoring rules
      const emptyScoringRules = {
        maxScore: 100,
        passThreshold: 70,
        questionScores: {
          "q1": 100
        }
      }

      const templateData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        questions: JSON.stringify(emptyTemplateQuestions),
        scoringRules: JSON.stringify(emptyScoringRules),
        validFrom: new Date(formData.validFrom).toISOString(),
        validTo: new Date(formData.validTo).toISOString()
      }

      const response = await templateService.createTemplate(templateData, user.token)
      console.log("Template created:", response)
      onOpenChange(false)
      
      // Navigate to template builder with the new template ID
      router.push(`/template-builder/${response.templateId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create template")
      console.error("Template creation error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Template</DialogTitle>
          <DialogDescription>
            Create a new audit template. You can add sections and questions after creation.
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert className="bg-red-50 text-red-900 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-sm font-medium text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Store Compliance Check"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this template"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Store Visit">Store Visit</SelectItem>
                  <SelectItem value="Compliance">Compliance</SelectItem>
                  <SelectItem value="Safety">Safety</SelectItem>
                  <SelectItem value="Quality">Quality</SelectItem>
                  <SelectItem value="Inventory">Inventory</SelectItem>
                  <SelectItem value="Customer Service">Customer Service</SelectItem>
                  <SelectItem value="Merchandising">Merchandising</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="validFrom">Valid From</Label>
                <Input
                  id="validFrom"
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="validTo">Valid To</Label>
                <Input
                  id="validTo"
                  type="date"
                  value={formData.validTo}
                  onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Template"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
