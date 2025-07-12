"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Edit, Trash2, Copy, Eye, Filter, Loader2, AlertTriangle } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { templateService, Template } from "@/lib/template-service"
import { useAuth } from "@/lib/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { format } from "date-fns"
import { TemplatePreview } from "@/components/template-preview"
import { useRouter } from "next/navigation"

interface TemplatesProps {
  setActiveView?: (view: string) => void
}

export function Templates({ setActiveView }: TemplatesProps) {
  const { user, handleTokenExpiration } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")

  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  
  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Fetch templates on component mount
  useEffect(() => {
    if (user?.token) {
      fetchTemplates()
    }
  }, [user?.token])
  
  const fetchTemplates = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      if (!user?.token) {
        throw new Error("Authentication required")
      }
      
      const data = await templateService.getTemplates(user.token, handleTokenExpiration)
      setTemplates(data)
    } catch (err) {
      console.error("Error fetching templates:", err)
      setError(err instanceof Error ? err.message : "Failed to load templates")
    } finally {
      setIsLoading(false)
    }
  }
  
  const openDeleteDialog = (template: Template) => {
    setTemplateToDelete(template)
    setDeleteDialogOpen(true)
  }

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false)
    setTemplateToDelete(null)
    setIsDeleting(false)
  }
  
  const deleteTemplate = async () => {
    if (!templateToDelete) return
    
    setIsDeleting(true)
    
    try {
      if (!user?.token) {
        throw new Error("Authentication required")
      }
      
      await templateService.deleteTemplate(templateToDelete.templateId, user.token, handleTokenExpiration)
      // Remove the template from the list
      setTemplates(templates.filter(t => t.templateId !== templateToDelete.templateId))
      closeDeleteDialog()
    } catch (err) {
      console.error("Error deleting template:", err)
      alert(err instanceof Error ? err.message : "Failed to delete template")
    } finally {
      setIsDeleting(false)
    }
  }

  // Function to preview a template
  const previewTemplateById = async (templateId: string) => {
    setIsPreviewLoading(true)
    try {
      if (!user?.token) {
        throw new Error("Authentication required")
      }
      
      const template = await templateService.getTemplateById(templateId, user.token, handleTokenExpiration)
      setPreviewTemplate(template)
    } catch (err) {
      console.error("Error fetching template for preview:", err)
      alert(err instanceof Error ? err.message : "Failed to load template for preview")
    } finally {
      setIsPreviewLoading(false)
    }
  }

  // Function to close the preview
  const closePreview = () => {
    setPreviewTemplate(null)
  }

  // Function to convert API template to preview format
  const convertToPreviewFormat = (apiTemplate: Template) => {
    try {
      // Parse the JSON strings from the API into objects
      const parsedQuestions = JSON.parse(apiTemplate.questions);
      
      // Convert to the format expected by TemplatePreview
      return {
        name: apiTemplate.name,
        description: apiTemplate.description,
        sections: parsedQuestions.sections.map((section: any) => ({
          id: section.title, // Use title as ID for simplicity
          title: section.title,
          description: section.description || "",
          questions: section.questions.map((q: any) => ({
            id: q.id,
            type: q.type,
            title: q.text,
            required: q.required,
            options: q.options,
            validation: {
              minValue: q.minValue,
              maxValue: q.maxValue,
            },
            scoring: 1, // Default scoring
          }))
        }))
      };
    } catch (e) {
      console.error("Error parsing template data:", e);
      return {
        name: apiTemplate.name,
        description: apiTemplate.description,
        sections: []
      };
    }
  }

  // Parse templates to extract section and question counts
  const parseTemplateInfo = (template: Template) => {
    try {
      const questionsData = JSON.parse(template.questions)
      const sections = questionsData.sections || []
      let totalQuestions = 0
      
      sections.forEach((section: any) => {
        totalQuestions += section.questions?.length || 0
      })
      
      return {
        sections: sections.length,
        questions: totalQuestions
      }
    } catch (e) {
      return { sections: 0, questions: 0 }
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return '-';
      return format(new Date(dateString), 'yyyy-MM-dd')
    } catch (e) {
      return '-'
    }
  }

  // Helper to get the latest date (updatedAt or fallback to createdAt)
  const getLatestTemplateDate = (templates: Template[]) => {
    if (templates.length === 0) return null;
    let latestDate: Date | null = null;
    for (const t of templates) {
      let date = t.updatedAt && !isNaN(new Date(t.updatedAt).getTime())
        ? new Date(t.updatedAt)
        : t.createdAt && !isNaN(new Date(t.createdAt).getTime())
          ? new Date(t.createdAt)
          : null;
      if (date && (!latestDate || date > latestDate)) {
        latestDate = date;
      }
    }
    return latestDate;
  }

  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // If a template is being previewed, show the preview component
  if (previewTemplate) {
    return (
      <TemplatePreview 
        template={convertToPreviewFormat(previewTemplate)} 
        onClose={closePreview}
        onSave={() => {
          closePreview();
          setActiveView ? setActiveView('template-builder') : router.push(`/template-builder/${previewTemplate.templateId}`);
        }}
      />
    );
  }

  // If preview is loading, show loading state
  if (isPreviewLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-gray-500">Loading template preview...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Templates</h2>
          <p className="text-gray-600">Create and manage audit templates</p>
        </div>
        <Button onClick={() => setActiveView ? setActiveView('template-builder') : router.push('/template-builder/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {templates.filter(t => new Date(t.validTo) > new Date()).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {templates.length > 0 
                ? `${Math.round((templates.filter(t => new Date(t.validTo) > new Date()).length / templates.length) * 100)}% of total` 
                : '0% of total'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(templates.map(t => t.category)).size}
            </div>
            <p className="text-xs text-muted-foreground">Distinct categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Update</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {templates.length > 0
                ? formatDate(getLatestTemplateDate(templates)?.toISOString() || '')
                : '-'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={fetchTemplates}>
          Refresh
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="bg-red-50 text-red-900 border-red-200">
          <AlertDescription className="text-sm font-medium text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-500">Loading templates...</p>
        </div>
      ) : templates.length === 0 ? (
        <div className="bg-white border rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium mb-2">No templates found</h3>
          <p className="text-gray-600 mb-6">Create your first template to get started</p>
          <Button onClick={() => setActiveView ? setActiveView('template-builder') : router.push('/template-builder/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>
      ) : (
        /* Templates Table */
        <Card>
          <CardHeader>
            <CardTitle>All Templates</CardTitle>
            <CardDescription>{filteredTemplates.length} templates found</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTemplates.map((template) => {
                  const templateInfo = parseTemplateInfo(template)
                  const isActive = new Date(template.validTo) > new Date()
                  
                  return (
                    <TableRow key={template.templateId}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-gray-500">{template.description}</div>
                          <div className="text-xs text-gray-400">{template.templateId}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{template.category}</Badge>
                      </TableCell>
                      <TableCell>
                        {templateInfo.sections} sections, {templateInfo.questions} questions
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatDate(template.validTo)}</div>
                          <div className={`text-xs ${isActive ? 'text-green-600' : 'text-red-600'}`}>
                            {isActive ? 'Active' : 'Expired'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div>{template.createdBy}</div>
                        <div className="text-xs text-gray-500">{formatDate(template.createdAt)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => previewTemplateById(template.templateId)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {/*
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setActiveView ? setActiveView('template-builder') : router.push(`/template-builder/${template.templateId}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Copy className="h-4 w-4" />
                          </Button>
                          */}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => openDeleteDialog(template)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={closeDeleteDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <AlertDialogTitle>Delete Template</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="space-y-3">
              <p>
                Are you sure you want to delete <strong>"{templateToDelete?.name}"</strong>?
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
                <p className="text-sm font-medium text-red-800">⚠️ This action cannot be undone</p>
                <p className="text-sm text-red-700">
                  Deleting this template may affect:
                </p>
                <ul className="text-sm text-red-700 list-disc list-inside space-y-1 ml-2">
                  <li>Active assignments using this template</li>
                  <li>Ongoing audits in progress</li>
                  <li>Historical audit data</li>
                  <li>Reports and analytics</li>
                </ul>
              </div>
              <p className="text-sm text-gray-600">
                Consider archiving the template instead if you need to preserve audit history.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={deleteTemplate}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Template'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}
