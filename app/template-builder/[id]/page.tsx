"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { TemplateBuilder } from "@/components/template-builder"
import { useAuth } from "@/lib/auth-context"
import { templateService } from "@/lib/template-service"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function TemplateBuilderPage() {
  const params = useParams()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [template, setTemplate] = useState<any>(null)
  
  useEffect(() => {
    if (user?.token && params.id) {
      fetchTemplate(params.id as string)
    }
  }, [user?.token, params.id])
  
  const fetchTemplate = async (templateId: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      if (!user?.token) {
        throw new Error("Authentication required")
      }
      
      const data = await templateService.getTemplateById(templateId, user.token)
      setTemplate(data)
    } catch (err) {
      console.error("Error fetching template:", err)
      setError(err instanceof Error ? err.message : "Failed to load template")
    } finally {
      setIsLoading(false)
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="text-gray-500">Loading template...</p>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="p-8">
        <Alert className="bg-red-50 text-red-900 border-red-200">
          <AlertDescription className="text-sm font-medium text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      </div>
    )
  }
  
  return <TemplateBuilder initialTemplate={template} setActiveView={(view) => {
    // Since this is a standalone page, we need to navigate back to the main app
    if (view === "templates") {
      window.location.href = "/"
    }
  }} />
} 