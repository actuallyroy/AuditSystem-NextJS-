"use client"

import { useState, useRef, type DragEvent } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Type,
  List,
  Camera,
  CheckSquare,
  Calendar,
  Hash,
  Star,
  MapPin,
  Clock,
  Phone,
  Mail,
  FileText,
  Plus,
  GripVertical,
  Settings,
  Trash2,
  Eye,
  Save,
  ArrowLeft,
  Loader2,
  Zap,
  Edit,
  AlertCircle,
  Copy,
  BookOpen,
} from "lucide-react"
import { QuestionConfigPanel } from "@/components/question-config-panel"
import { TemplatePreview } from "@/components/template-preview"
import { Template as APITemplate, templateService } from "@/lib/template-service"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Update conditional logic interfaces
interface ConditionalLogic {
  id: string
  sourceQuestionId: string
  condition: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty'
  value: string | number | boolean
  action: 'show' | 'hide' | 'skip'
  targetSectionId?: string
  targetQuestionIds?: string[]
}

interface Question {
  id: string
  type: string
  title: string
  description?: string
  required: boolean
  options?: string[]
  validation?: any
  scoring?: number
  conditionalLogic?: ConditionalLogic[]
}

interface Section {
  id: string
  title: string
  description?: string
  questions: Question[]
  conditionalLogic?: ConditionalLogic[]
  isVisible?: boolean
}

interface Template {
  name: string
  description: string
  category: string
  sections: Section[]
}

interface TemplateBuilderProps {
  initialTemplate?: APITemplate
  setActiveView?: (view: string) => void
}

export function TemplateBuilder({ initialTemplate, setActiveView }: TemplateBuilderProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [template, setTemplate] = useState<Template>(() => {
    if (initialTemplate) {
      try {
        // Parse the JSON strings from the API into objects
        const parsedQuestions = JSON.parse(initialTemplate.questions);
        const parsedScoringRules = JSON.parse(initialTemplate.scoringRules);
        
        // Adapt API template format to our component format
        return {
          name: initialTemplate.name,
          description: initialTemplate.description,
          category: initialTemplate.category || "Store Visit",
          sections: parsedQuestions.sections.map((section: any) => ({
            id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: section.title,
            description: section.description || "",
            questions: section.questions.map((q: any) => ({
              id: q.id || `question-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              type: q.type,
              title: q.text,
              required: q.required,
              options: q.options,
              validation: {
                minValue: q.minValue,
                maxValue: q.maxValue,
              },
              scoring: parsedScoringRules.questionScores[q.id] || 1
            })),
            conditionalLogic: section.conditionalLogic || [],
            isVisible: section.isVisible !== false
          })),
        };
      } catch (e) {
        console.error("Error parsing template data:", e);
        // Return default template if parsing failed
        return {
          name: "",
          description: "",
          category: "Store Visit",
          sections: [],
        };
      }
    }
    
    // Default template if no initialTemplate
    return {
      name: "",
      description: "",
      category: "Store Visit",
      sections: [],
    };
  });

  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [draggedQuestionType, setDraggedQuestionType] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const dropZoneRef = useRef<HTMLDivElement>(null)
  
  // Add state for section drag-and-drop
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null)
  const [dragOverSectionId, setDragOverSectionId] = useState<string | null>(null)

  // Add state for conditional logic dialog
  const [showLogicDialog, setShowLogicDialog] = useState(false)
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null)
  const [editingLogic, setEditingLogic] = useState<ConditionalLogic | null>(null)

  // Add state for validation errors
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // Add state for predefined sections dialog
  const [showPredefinedSections, setShowPredefinedSections] = useState(false)

  const questionTypes = [
    {
      id: "text",
      name: "Text Input",
      icon: Type,
      description: "Free text entry",
      color: "bg-blue-500",
    },
    {
      id: "numeric",
      name: "Numeric",
      icon: Hash,
      description: "Number entry",
      color: "bg-indigo-500",
    },
    {
      id: "single_choice",
      name: "Single Choice",
      icon: CheckSquare,
      description: "Single selection",
      color: "bg-purple-500",
    },
    {
      id: "multiple_choice",
      name: "Multiple Choice",
      icon: CheckSquare,
      description: "Multiple selections",
      color: "bg-purple-600",
    },
    {
      id: "dropdown",
      name: "Dropdown",
      icon: List,
      description: "Select list",
      color: "bg-green-500",
    },
    {
      id: "date_time",
      name: "Date/Time",
      icon: Calendar,
      description: "Date picker",
      color: "bg-red-500",
    },
    {
      id: "file_upload",
      name: "File Upload",
      icon: Camera,
      description: "Photo/Document",
      color: "bg-orange-500",
    },
    {
      id: "barcode",
      name: "Barcode Scanner",
      icon: FileText,
      description: "Scan codes",
      color: "bg-blue-600",
    },
    {
      id: "signature",
      name: "Signature",
      icon: Edit,
      description: "Digital signature",
      color: "bg-cyan-500",
    },
    {
      id: "gps",
      name: "GPS Location",
      icon: MapPin,
      description: "Auto-capture",
      color: "bg-teal-500",
    },
  ]

  const updateTemplateInfo = (field: 'name' | 'description' | 'category', value: string) => {
    setTemplate((prev) => ({ ...prev, [field]: value }))
    // Clear validation errors when user makes changes
    if (validationErrors.length > 0) {
      setValidationErrors([])
    }
  }

  const addSection = () => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      title: `Section ${template.sections.length + 1}`,
      description: "",
      questions: [],
    }
    setTemplate((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }))
    setActiveSection(newSection.id)
    // Clear validation errors when user adds sections
    if (validationErrors.length > 0) {
      setValidationErrors([])
    }
  }

  const updateSection = (sectionId: string, updates: Partial<Section>) => {
    setTemplate((prev) => ({
      ...prev,
      sections: prev.sections.map((section) => (section.id === sectionId ? { ...section, ...updates } : section)),
    }))
    // Clear validation errors when user updates sections
    if (validationErrors.length > 0) {
      setValidationErrors([])
    }
  }

  const deleteSection = (sectionId: string) => {
    setTemplate((prev) => ({
      ...prev,
      sections: prev.sections.filter((section) => section.id !== sectionId),
    }))
    if (activeSection === sectionId) {
      setActiveSection(null)
    }
  }

  // Duplicate section function
  const duplicateSection = (sectionId: string) => {
    const sectionToDuplicate = template.sections.find(s => s.id === sectionId)
    if (!sectionToDuplicate) return

    const duplicatedSection: Section = {
      id: `section-${Date.now()}`,
      title: `${sectionToDuplicate.title} (Copy)`,
      description: sectionToDuplicate.description,
      questions: sectionToDuplicate.questions.map(q => ({
        ...q,
        id: `question-${Date.now()}-${Math.random()}`
      })),
      conditionalLogic: sectionToDuplicate.conditionalLogic?.map(logic => ({
        ...logic,
        id: `logic-${Date.now()}-${Math.random()}`,
        targetSectionId: `section-${Date.now()}`
      }))
    }

    setTemplate((prev) => ({
      ...prev,
      sections: [...prev.sections, duplicatedSection],
    }))
    setActiveSection(duplicatedSection.id)
  }

  // Predefined sections data
  const predefinedSections = [
    {
      id: "store-info",
      title: "Store Information",
      description: "Basic store details and identification",
      questions: [
        {
          id: "store-name",
          type: "text",
          title: "Store Name",
          required: true,
          scoring: 1
        },
        {
          id: "store-address",
          type: "text",
          title: "Store Address",
          required: true,
          scoring: 1
        },
        {
          id: "store-manager",
          type: "text",
          title: "Store Manager",
          required: false,
          scoring: 1
        },
        {
          id: "store-phone",
          type: "text",
          title: "Store Phone Number",
          required: false,
          scoring: 1
        }
      ]
    },
    {
      id: "product-display",
      title: "Product Display & Merchandising",
      description: "Product presentation and shelf management",
      questions: [
        {
          id: "shelf-organization",
          type: "single_choice",
          title: "Are products properly organized on shelves?",
          required: true,
          options: ["Yes", "No", "Partially"],
          scoring: 3
        },
        {
          id: "product-visibility",
          type: "single_choice",
          title: "Are products clearly visible to customers?",
          required: true,
          options: ["Excellent", "Good", "Fair", "Poor"],
          scoring: 2
        },
        {
          id: "price-tags",
          type: "single_choice",
          title: "Are all price tags present and legible?",
          required: true,
          options: ["Yes", "No", "Some missing"],
          scoring: 2
        },
        {
          id: "display-photos",
          type: "file_upload",
          title: "Take photos of product displays",
          required: false,
          scoring: 1
        }
      ]
    },
    {
      id: "cleanliness",
      title: "Cleanliness & Maintenance",
      description: "Store cleanliness and maintenance standards",
      questions: [
        {
          id: "floor-cleanliness",
          type: "single_choice",
          title: "How clean are the floors?",
          required: true,
          options: ["Very Clean", "Clean", "Needs Attention", "Dirty"],
          scoring: 3
        },
        {
          id: "restroom-condition",
          type: "single_choice",
          title: "What is the condition of the restrooms?",
          required: true,
          options: ["Excellent", "Good", "Fair", "Poor"],
          scoring: 3
        },
        {
          id: "lighting-condition",
          type: "single_choice",
          title: "Is the lighting adequate throughout the store?",
          required: true,
          options: ["Yes", "No", "Some areas need improvement"],
          scoring: 2
        },
        {
          id: "temperature",
          type: "numeric",
          title: "What is the store temperature? (Fahrenheit)",
          required: false,
          validation: { min: 60, max: 85 },
          scoring: 1
        }
      ]
    },
    {
      id: "customer-service",
      title: "Customer Service",
      description: "Staff behavior and customer interaction",
      questions: [
        {
          id: "staff-greeting",
          type: "single_choice",
          title: "Did staff greet customers appropriately?",
          required: true,
          options: ["Yes", "No", "Some staff did"],
          scoring: 2
        },
        {
          id: "staff-uniform",
          type: "single_choice",
          title: "Are staff wearing proper uniforms?",
          required: true,
          options: ["Yes", "No", "Partially"],
          scoring: 2
        },
        {
          id: "staff-knowledge",
          type: "single_choice",
          title: "How knowledgeable are staff about products?",
          required: true,
          options: ["Very Knowledgeable", "Knowledgeable", "Somewhat", "Not Knowledgeable"],
          scoring: 3
        },
        {
          id: "customer-feedback",
          type: "text",
          title: "Any customer complaints or feedback?",
          required: false,
          scoring: 1
        }
      ]
    },
    {
      id: "safety-compliance",
      title: "Safety & Compliance",
      description: "Safety standards and regulatory compliance",
      questions: [
        {
          id: "emergency-exits",
          type: "single_choice",
          title: "Are emergency exits clearly marked and unobstructed?",
          required: true,
          options: ["Yes", "No", "Partially"],
          scoring: 5
        },
        {
          id: "fire-extinguishers",
          type: "single_choice",
          title: "Are fire extinguishers present and accessible?",
          required: true,
          options: ["Yes", "No", "Some missing"],
          scoring: 4
        },
        {
          id: "safety-signs",
          type: "single_choice",
          title: "Are safety signs properly displayed?",
          required: true,
          options: ["Yes", "No", "Some missing"],
          scoring: 2
        },
        {
          id: "safety-violations",
          type: "text",
          title: "Any safety violations observed?",
          required: false,
          scoring: 1
        }
      ]
    }
  ]

  // Add predefined section function
  const addPredefinedSection = (predefinedSection: any) => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      title: predefinedSection.title,
      description: predefinedSection.description,
      questions: predefinedSection.questions.map((q: any) => ({
        ...q,
        id: `question-${Date.now()}-${Math.random()}`
      }))
    }

    setTemplate((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }))
    setActiveSection(newSection.id)
    setShowPredefinedSections(false)
  }

  const handleDragStart = (e: DragEvent, questionType: string) => {
    setDraggedQuestionType(questionType)
    e.dataTransfer.effectAllowed = "copy"
  }

  // Add section drag handlers
  const handleSectionDragStart = (e: DragEvent, sectionId: string) => {
    setDraggedSectionId(sectionId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleSectionDragOver = (e: DragEvent, sectionId: string) => {
    e.preventDefault()
    if (draggedSectionId && draggedSectionId !== sectionId) {
      setDragOverSectionId(sectionId)
      e.dataTransfer.dropEffect = "move"
    }
  }

  const handleSectionDragLeave = () => {
    setDragOverSectionId(null)
  }

  const handleSectionDrop = (e: DragEvent, targetSectionId: string) => {
    e.preventDefault()
    if (!draggedSectionId || draggedSectionId === targetSectionId) return
    
    setTemplate(prev => {
      // Find the indices of the dragged and target sections
      const sections = [...prev.sections]
      const draggedIndex = sections.findIndex(s => s.id === draggedSectionId)
      const targetIndex = sections.findIndex(s => s.id === targetSectionId)
      
      if (draggedIndex < 0 || targetIndex < 0) return prev
      
      // Remove the dragged section from the array
      const [draggedSection] = sections.splice(draggedIndex, 1)
      
      // Insert the dragged section at the target position
      sections.splice(targetIndex, 0, draggedSection)
      
      return {
        ...prev,
        sections
      }
    })
    
    setDraggedSectionId(null)
    setDragOverSectionId(null)
  }

  const handleSectionDragEnd = () => {
    setDraggedSectionId(null)
    setDragOverSectionId(null)
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"
  }

  const handleDrop = (e: DragEvent, sectionId: string) => {
    e.preventDefault()

    if (!draggedQuestionType) return

    const questionType = questionTypes.find((type) => type.id === draggedQuestionType)
    if (!questionType) return

    const newQuestion: Question = {
      id: `question-${Date.now()}`,
      type: draggedQuestionType,
      title: `New ${questionType.name}`,
      required: false,
      scoring: 1,
    }

    // Add default options for dropdown/single_choice/multiple_choice
    if (["dropdown", "single_choice", "multiple_choice"].includes(draggedQuestionType)) {
      newQuestion.options = ["Option 1", "Option 2", "Option 3"]
    }

    setTemplate((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId ? { ...section, questions: [...section.questions, newQuestion] } : section,
      ),
    }))

    setDraggedQuestionType(null)
    setSelectedQuestion(newQuestion)
  }

  const updateQuestion = (sectionId: string, questionId: string, updates: Partial<Question>) => {
    setTemplate((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              questions: section.questions.map((question) =>
                question.id === questionId ? { ...question, ...updates } : question,
              ),
            }
          : section,
      ),
    }))

    if (selectedQuestion?.id === questionId) {
      setSelectedQuestion((prev) => (prev ? { ...prev, ...updates } : null))
    }
  }

  const deleteQuestion = (sectionId: string, questionId: string) => {
    setTemplate((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? { ...section, questions: section.questions.filter((q) => q.id !== questionId) }
          : section,
      ),
    }))

    if (selectedQuestion?.id === questionId) {
      setSelectedQuestion(null)
    }
  }

  const getQuestionIcon = (type: string) => {
    const questionType = questionTypes.find((qt) => qt.id === type)
    return questionType?.icon || Type
  }

  const addSectionConditionalLogic = (sectionId: string) => {
    setActiveSectionId(sectionId)
    setEditingLogic(null)
    setShowLogicDialog(true)
  }

  const editSectionConditionalLogic = (sectionId: string, logicId: string) => {
    const section = template.sections.find(s => s.id === sectionId)
    if (!section) return
    
    const logic = section.conditionalLogic?.find(l => l.id === logicId)
    if (!logic) return
    
    setActiveSectionId(sectionId)
    setEditingLogic(logic)
    setShowLogicDialog(true)
  }

  const saveConditionalLogic = (logic: ConditionalLogic) => {
    if (!activeSectionId) return
    
    if (editingLogic) {
      // Update existing logic
      updateSectionConditionalLogic(activeSectionId, editingLogic.id, logic)
    } else {
      // Add new logic
      const newLogic: ConditionalLogic = {
        id: `logic-${Date.now()}`,
        sourceQuestionId: logic.sourceQuestionId,
        condition: logic.condition,
        value: logic.value,
        action: logic.action,
        targetSectionId: logic.targetSectionId
      }
      
      setTemplate((prev: Template) => ({
        ...prev,
        sections: prev.sections.map((section) => 
          section.id === activeSectionId
          ? { 
              ...section, 
              conditionalLogic: [...(section.conditionalLogic || []), newLogic] 
            } 
          : section
        ),
      }))
    }
    
    setShowLogicDialog(false)
  }

  const updateSectionConditionalLogic = (sectionId: string, logicId: string, updates: Partial<ConditionalLogic> | null) => {
    setTemplate((prev: Template) => ({
      ...prev,
      sections: prev.sections.map((section) => {
        if (section.id !== sectionId) return section;
        
        if (updates === null) {
          // Remove the logic rule if updates is null
          return {
            ...section,
            conditionalLogic: (section.conditionalLogic || []).filter(logic => logic.id !== logicId)
          };
        }
        
        // Update the logic rule
        return {
          ...section,
          conditionalLogic: (section.conditionalLogic || []).map(logic => 
            logic.id === logicId ? { ...logic, ...updates } : logic
          )
        };
      }),
    }))
  }

  const saveTemplate = async () => {
    if (!user?.token) {
      alert("You must be logged in to save templates")
      return
    }
    
    setIsSaving(true)
    
    try {
      // Convert our UI template format to API format
      const apiQuestions = {
        sections: template.sections.map(section => ({
          title: section.title,
          description: section.description,
          questions: section.questions.map(q => ({
            id: q.id,
            text: q.title,
            type: q.type,
            required: q.required,
            options: q.options,
            minValue: q.validation?.minValue,
            maxValue: q.validation?.maxValue,
          })),
          // Include section-level conditional logic
          conditionalLogic: section.conditionalLogic || [],
          isVisible: section.isVisible !== false
        }))
      }
      
      // Prepare scoring rules
      const apiScoringRules: {
        maxScore: number;
        passThreshold: number;
        questionScores: Record<string, number>;
      } = {
        maxScore: 100,
        passThreshold: 70,
        questionScores: {}
      }
      
      // Calculate scores for each question
      let totalScore = 0
      template.sections.forEach(section => {
        section.questions.forEach(question => {
          const score = question.scoring || 1
          apiScoringRules.questionScores[question.id] = score
          totalScore += score
        })
      })
      
      // Normalize scores to 100 if needed
      if (totalScore > 0 && totalScore !== 100) {
        const factor = 100 / totalScore
        Object.keys(apiScoringRules.questionScores).forEach(key => {
          apiScoringRules.questionScores[key] = Math.round(apiScoringRules.questionScores[key] * factor)
        })
      }
      
      // Prepare request data
      const templateData = {
        name: template.name,
        description: template.description,
        category: template.category,
        questions: JSON.stringify(apiQuestions),
        scoringRules: JSON.stringify(apiScoringRules),
        validFrom: initialTemplate?.validFrom || new Date().toISOString(),
        validTo: initialTemplate?.validTo || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
      }
      
      let response
      
      if (initialTemplate?.templateId) {
        // Update existing template
        response = await templateService.updateTemplate({
          ...templateData,
          templateId: initialTemplate.templateId
        }, user.token)
        console.log("Template updated:", response)
        alert("Template updated successfully!")
      } else {
        // Create new template
        response = await templateService.createTemplate(templateData, user.token)
        console.log("Template created:", response)
        alert("Template created successfully!")
      }
      
      // Navigate back to templates list
      setActiveView?.("templates")
    } catch (error) {
      console.error("Error saving template:", error)
      alert(`Error saving template: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsSaving(false)
    }
  }

  // Add validation function
  const validateTemplate = (): boolean => {
    const errors: string[] = []
    
    if (!template.name || template.name.trim() === '') {
      errors.push('Template name is required')
    }
    
    if (!template.category || template.category.trim() === '') {
      errors.push('Template category is required')
    }
    
    if (template.sections.length === 0) {
      errors.push('At least one section is required')
    }
    
    // Check if sections have titles and questions
    template.sections.forEach((section, index) => {
      if (!section.title || section.title.trim() === '') {
        errors.push(`Section ${index + 1} must have a title`)
      }
      
      if (section.questions.length === 0) {
        errors.push(`Section "${section.title || `Section ${index + 1}`}" must have at least one question`)
      }
      
      // Check if questions have titles
      section.questions.forEach((question, qIndex) => {
        if (!question.title || question.title.trim() === '') {
          errors.push(`Question ${qIndex + 1} in section "${section.title}" must have a title`)
        }
      })
    })
    
    setValidationErrors(errors)
    return errors.length === 0
  }

  // Update the preview button handler
  const handlePreview = () => {
    if (validateTemplate()) {
      setShowPreview(true)
    }
  }

  // Show preview if enabled
  if (showPreview) {
    return <TemplatePreview template={template} onClose={() => setShowPreview(false)} onSave={saveTemplate} />
  }

  // Add a utility function to get appropriate conditions based on question type
  const getConditionsForQuestionType = (questionType: string) => {
    // Base conditions available for all question types
    const baseConditions = [
      { value: "equals", label: "Equals" },
      { value: "not_equals", label: "Not Equals" },
      { value: "is_empty", label: "Is Empty" },
      { value: "is_not_empty", label: "Is Not Empty" }
    ];
    
    switch (questionType) {
      case "text":
      case "signature":
      case "barcode":
        return [
          ...baseConditions,
          { value: "contains", label: "Contains" },
          { value: "not_contains", label: "Does Not Contain" }
        ];
      
      case "numeric":
        return [
          ...baseConditions,
          { value: "greater_than", label: "Greater Than" },
          { value: "less_than", label: "Less Than" }
        ];
      
      case "date_time":
        return [
          ...baseConditions,
          { value: "greater_than", label: "After" },
          { value: "less_than", label: "Before" }
        ];
      
      default:
        return baseConditions;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setActiveView?.("templates")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Templates
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="text-xl font-semibold">Template Builder</h1>
              <p className="text-sm text-gray-500">Create comprehensive audit templates with drag & drop</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePreview}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button onClick={saveTemplate} className="bg-blue-600 hover:bg-blue-700" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Template
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Add validation errors display after the template info section */}
      {validationErrors.length > 0 && (
        <div className="bg-white border-b p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800 mb-2">Please fix the following issues before previewing:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="text-sm text-red-700">{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Question Types Sidebar */}
        <div className="w-80 bg-white border-r flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-semibold mb-2">Question Types</h3>
            <p className="text-sm text-gray-500">Drag question types to add them to your template</p>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="grid gap-3">
              {questionTypes.map((type) => (
                <div
                  key={type.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, type.id)}
                  className="flex items-center gap-3 p-3 border rounded-lg cursor-grab hover:shadow-md transition-shadow bg-white"
                >
                  <div className={`p-2 rounded-lg ${type.color}`}>
                    <type.icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{type.name}</h4>
                    <p className="text-xs text-gray-500">{type.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Template Info */}
          <div className="bg-white border-b p-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  placeholder="e.g., Store Compliance Check"
                  value={template.name}
                  onChange={(e) => updateTemplateInfo('name', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="template-category">Category</Label>
                <Select
                  value={template.category}
                  onValueChange={(value) => updateTemplateInfo('category', value)}
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
              <div>
                <Label htmlFor="template-description">Description</Label>
                <Input
                  id="template-description"
                  placeholder="Brief description of this template"
                  value={template.description}
                  onChange={(e) => updateTemplateInfo('description', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Template Builder */}
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-4xl mx-auto space-y-6">

              {/* Sections */}
              {template.sections.map((section, sectionIndex) => (
                <Card 
                  key={section.id} 
                  className={`${activeSection === section.id ? "ring-2 ring-blue-500" : ""} ${
                    dragOverSectionId === section.id ? "border-blue-500 border-2" : ""
                  } ${draggedSectionId === section.id ? "opacity-50" : ""}`}
                  draggable
                  onDragStart={(e) => handleSectionDragStart(e, section.id)}
                  onDragOver={(e) => handleSectionDragOver(e, section.id)}
                  onDragLeave={handleSectionDragLeave}
                  onDrop={(e) => handleSectionDrop(e, section.id)}
                  onDragEnd={handleSectionDragEnd}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center">
                          <GripVertical className="h-5 w-5 text-gray-400 mr-2 cursor-grab" />
                          <Input
                            value={section.title}
                            onChange={(e) => updateSection(section.id, { title: e.target.value })}
                            className="font-semibold text-lg border-none p-0 h-auto focus-visible:ring-0"
                            placeholder="Section Title"
                          />
                        </div>
                        <Input
                          value={section.description || ""}
                          onChange={(e) => updateSection(section.id, { description: e.target.value })}
                          className="text-sm text-gray-600 border-none p-0 h-auto focus-visible:ring-0"
                          placeholder="Section description (optional)"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        {section.conditionalLogic && section.conditionalLogic.length > 0 && (
                          <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-800 border-yellow-200">
                            <Zap className="h-3 w-3 mr-1" /> Conditional
                          </Badge>
                        )}
                        <Badge variant="secondary">{section.questions.length} questions</Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addSectionConditionalLogic(section.id)}
                          title="Add conditional logic"
                        >
                          <Zap className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => duplicateSection(section.id)}
                          title="Duplicate section"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSection(section.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete section"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    {/* Drop Zone */}
                    <div
                      ref={dropZoneRef}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, section.id)}
                      className={`min-h-32 border-2 border-dashed rounded-lg p-4 transition-colors ${
                        draggedQuestionType ? "border-blue-500 bg-blue-50" : "border-gray-300"
                      }`}
                    >
                      {section.questions.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="text-gray-400 mb-2">
                            <Plus className="h-8 w-8 mx-auto" />
                          </div>
                          <p className="text-gray-500">Drag question types here to build your section</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {section.questions.map((question, questionIndex) => {
                            const QuestionIcon = getQuestionIcon(question.type)
                            return (
                              <div
                                key={question.id}
                                onClick={() => setSelectedQuestion(question)}
                                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                  selectedQuestion?.id === question.id
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <GripVertical className="h-4 w-4 text-gray-400" />
                                  <QuestionIcon className="h-4 w-4 text-gray-600" />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{question.title}</span>
                                      {question.required && (
                                        <Badge variant="destructive" className="text-xs">
                                          Required
                                        </Badge>
                                      )}
                                      {question.conditionalLogic && question.conditionalLogic.length > 0 && (
                                        <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-800 border-yellow-200">
                                          <Zap className="h-3 w-3 mr-1" /> Conditional
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-500 capitalize">{question.type} question</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setSelectedQuestion(question)
                                      }}
                                    >
                                      <Settings className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        deleteQuestion(section.id, question.id)
                                      }}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </CardContent>

                  {section.conditionalLogic && section.conditionalLogic.length > 0 && (
                    <div className="px-4 pb-4 pt-1">
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs font-medium text-gray-500 mb-2">Conditional Logic Rules:</p>
                        <div className="space-y-2">
                          {section.conditionalLogic.map((logic) => {
                            const sourceQuestion = template.sections
                              .flatMap(s => s.questions)
                              .find(q => q.id === logic.sourceQuestionId);
                            
                            return (
                              <div 
                                key={logic.id} 
                                className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded border cursor-pointer hover:bg-gray-100"
                                onClick={() => editSectionConditionalLogic(section.id, logic.id)}
                              >
                                <span>
                                  <Zap className="h-3 w-3 inline mr-1 text-yellow-600" />
                                  {logic.action === 'show' ? 'Show' : 'Hide'} when {sourceQuestion?.title || 'Question'} {' '}
                                  {logic.condition.replace('_', ' ')} {logic.value}
                                </span>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateSectionConditionalLogic(section.id, logic.id, null);
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              ))}

              {template.sections.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Start Building Your Template</h3>
                    <p className="text-gray-500 mb-4">Add sections to organize your audit questions</p>
                    <Button onClick={addSection}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Section
                    </Button>
                  </CardContent>
                </Card>
              )}

              
              {/* Add Section Buttons */}
              <div className="flex justify-center gap-4">
                <Button onClick={addSection} variant="outline" className="border-dashed border-2 bg-transparent">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Section
                </Button>
                <Button 
                  onClick={() => setShowPredefinedSections(true)} 
                  variant="outline" 
                  className="border-dashed border-2 bg-transparent"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Predefined Sections
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Question Configuration Panel */}
        {selectedQuestion && (
          <QuestionConfigPanel
            question={selectedQuestion}
            allQuestions={template.sections.flatMap(s => s.questions)}
            sections={template.sections}
            onUpdate={(updates) => {
              const section = template.sections.find((s) => s.questions.some((q) => q.id === selectedQuestion.id))
              if (section) {
                updateQuestion(section.id, selectedQuestion.id, updates)
              }
            }}
            onClose={() => setSelectedQuestion(null)}
          />
        )}
      </div>

      {/* Section Conditional Logic Dialog */}
      <Dialog open={showLogicDialog} onOpenChange={setShowLogicDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Section Conditional Logic</DialogTitle>
            <DialogDescription>
              Set conditions to control when this section is shown or hidden.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {activeSectionId && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Source Question</Label>
                    <Select 
                      value={editingLogic?.sourceQuestionId || ""}
                      onValueChange={(value) => setEditingLogic(prev => 
                        prev ? {...prev, sourceQuestionId: value} : {
                          id: `logic-${Date.now()}`,
                          sourceQuestionId: value,
                          condition: 'equals',
                          value: '',
                          action: 'show',
                          targetSectionId: activeSectionId
                        }
                      )}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a question..." />
                      </SelectTrigger>
                      <SelectContent>
                        {template.sections
                          // Filter out questions from the current section
                          .filter(section => section.id !== activeSectionId)
                          .flatMap(section => 
                            section.questions.map(question => (
                              <SelectItem key={question.id} value={question.id}>
                                {section.title} → {question.title}
                              </SelectItem>
                            ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Condition</Label>
                    <Select 
                      value={editingLogic?.condition || 'equals'} 
                      onValueChange={(value: any) => setEditingLogic(prev => 
                        prev ? {...prev, condition: value} : {
                          id: `logic-${Date.now()}`,
                          sourceQuestionId: '',
                          condition: value,
                          value: '',
                          action: 'show',
                          targetSectionId: activeSectionId
                        }
                      )}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {editingLogic?.sourceQuestionId ? (
                          (() => {
                            // Find the question and its type
                            const sourceQuestion = template.sections
                              .flatMap(s => s.questions)
                              .find(q => q.id === editingLogic.sourceQuestionId);
                            
                            if (!sourceQuestion) return (
                              <SelectItem value="equals">Equals</SelectItem>
                            );
                            
                            // Get conditions appropriate for this question type
                            return getConditionsForQuestionType(sourceQuestion.type).map(condition => 
                              <SelectItem key={condition.value} value={condition.value}>{condition.label}</SelectItem>
                            );
                          })()
                        ) : (
                          // Default conditions if no source question is selected
                          <SelectItem value="equals">Equals</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {!['is_empty', 'is_not_empty'].includes(editingLogic?.condition || '') && (
                  <div className="space-y-2">
                    <Label>Value</Label>
                    {editingLogic?.sourceQuestionId ? (
                      (() => {
                        // Find the question and its type
                        const sourceQuestion = template.sections
                          .flatMap(s => s.questions)
                          .find(q => q.id === editingLogic.sourceQuestionId);
                        
                        if (!sourceQuestion) return (
                          <Input
                            value={editingLogic?.value?.toString() || ''}
                            onChange={(e) => setEditingLogic(prev => 
                              prev ? {...prev, value: e.target.value} : {
                                id: `logic-${Date.now()}`,
                                sourceQuestionId: '',
                                condition: 'equals',
                                value: e.target.value,
                                action: 'show',
                                targetSectionId: activeSectionId
                              }
                            )}
                            placeholder="Enter comparison value"
                          />
                        );
                        
                        // Render different input types based on question type
                        switch (sourceQuestion.type) {
                          case "numeric":
                            return (
                              <Input
                                type="number"
                                value={editingLogic?.value?.toString() || ''}
                                onChange={(e) => setEditingLogic(prev => 
                                  prev ? {...prev, value: e.target.value} : {
                                    id: `logic-${Date.now()}`,
                                    sourceQuestionId: '',
                                    condition: 'equals',
                                    value: e.target.value,
                                    action: 'show',
                                    targetSectionId: activeSectionId
                                  }
                                )}
                                placeholder="Enter number value"
                              />
                            );
                          case "date_time":
                            return (
                              <Input
                                type="date"
                                value={editingLogic?.value?.toString() || ''}
                                onChange={(e) => setEditingLogic(prev => 
                                  prev ? {...prev, value: e.target.value} : {
                                    id: `logic-${Date.now()}`,
                                    sourceQuestionId: '',
                                    condition: 'equals',
                                    value: e.target.value,
                                    action: 'show',
                                    targetSectionId: activeSectionId
                                  }
                                )}
                              />
                            );
                          case "single_choice":
                          case "multiple_choice":
                          case "dropdown":
                            return sourceQuestion.options ? (
                              <Select
                                value={editingLogic?.value?.toString() || ''}
                                onValueChange={(value) => setEditingLogic(prev => 
                                  prev ? {...prev, value} : {
                                    id: `logic-${Date.now()}`,
                                    sourceQuestionId: '',
                                    condition: 'equals',
                                    value,
                                    action: 'show',
                                    targetSectionId: activeSectionId
                                  }
                                )}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select option..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {sourceQuestion.options.map((option, index) => (
                                    <SelectItem key={index} value={option}>{option}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input
                                value={editingLogic?.value?.toString() || ''}
                                onChange={(e) => setEditingLogic(prev => 
                                  prev ? {...prev, value: e.target.value} : {
                                    id: `logic-${Date.now()}`,
                                    sourceQuestionId: '',
                                    condition: 'equals',
                                    value: e.target.value,
                                    action: 'show',
                                    targetSectionId: activeSectionId
                                  }
                                )}
                                placeholder="Enter comparison value"
                              />
                            );
                          default:
                            return (
                              <Input
                                value={editingLogic?.value?.toString() || ''}
                                onChange={(e) => setEditingLogic(prev => 
                                  prev ? {...prev, value: e.target.value} : {
                                    id: `logic-${Date.now()}`,
                                    sourceQuestionId: '',
                                    condition: 'equals',
                                    value: e.target.value,
                                    action: 'show',
                                    targetSectionId: activeSectionId
                                  }
                                )}
                                placeholder="Enter comparison value"
                              />
                            );
                        }
                      })()
                    ) : (
                      <Input
                        value={editingLogic?.value?.toString() || ''}
                        onChange={(e) => setEditingLogic(prev => 
                          prev ? {...prev, value: e.target.value} : {
                            id: `logic-${Date.now()}`,
                            sourceQuestionId: '',
                            condition: 'equals',
                            value: e.target.value,
                            action: 'show',
                            targetSectionId: activeSectionId
                          }
                        )}
                        placeholder="Enter comparison value"
                      />
                    )}
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label>Action</Label>
                  <Select 
                    value={editingLogic?.action || 'show'} 
                    onValueChange={(value: 'show' | 'hide') => setEditingLogic(prev => 
                      prev ? {...prev, action: value} : {
                        id: `logic-${Date.now()}`,
                        sourceQuestionId: '',
                        condition: 'equals',
                        value: '',
                        action: value,
                        targetSectionId: activeSectionId
                      }
                    )}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="show">Show Section</SelectItem>
                      <SelectItem value="hide">Hide Section</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLogicDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              if (editingLogic) {
                saveConditionalLogic(editingLogic)
              }
            }}>
              Save Logic
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Predefined Sections Dialog */}
      <Dialog open={showPredefinedSections} onOpenChange={setShowPredefinedSections}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Predefined Sections</DialogTitle>
            <DialogDescription>
              Choose from our collection of pre-built sections to quickly add common audit areas to your template.
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh]">
            <div className="grid gap-4 py-4">
              {predefinedSections.map((section) => (
                <Card key={section.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{section.title}</CardTitle>
                        <p className="text-sm text-gray-600 mb-3">{section.description}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{section.questions.length} questions</span>
                          <span>•</span>
                          <span>Total score: {section.questions.reduce((sum, q) => sum + (q.scoring || 1), 0)} points</span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1">
                          {section.questions.slice(0, 3).map((q, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {q.type.replace('_', ' ')}
                            </Badge>
                          ))}
                          {section.questions.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{section.questions.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button 
                        onClick={() => addPredefinedSection(section)}
                        size="sm"
                        className="ml-4"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPredefinedSections(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
