"use client"

import { useState, useRef, type DragEvent } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
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
} from "lucide-react"
import { QuestionConfigPanel } from "@/components/question-config-panel"
import { TemplatePreview } from "@/components/template-preview"
import { Template as APITemplate, templateService } from "@/lib/template-service"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

// Add conditional logic interfaces
interface ConditionalLogic {
  id: string
  sourceQuestionId: string
  condition: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty'
  value: string | number | boolean
  action: 'show' | 'hide' | 'skip'
  targetQuestionIds: string[]
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
}

interface Template {
  name: string
  description: string
  sections: Section[]
}

interface TemplateBuilderProps {
  initialTemplate?: APITemplate
}

export function TemplateBuilder({ initialTemplate }: TemplateBuilderProps) {
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
              scoring: parsedScoringRules.questionScores[q.id] || 1,
              conditionalLogic: q.conditionalLogic || [],
            }))
          })),
        };
      } catch (e) {
        console.error("Error parsing template data:", e);
      }
    }
    
    // Default template if no initialTemplate or parsing failed
    return {
      name: "",
      description: "",
      sections: [],
    };
  });

  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [draggedQuestionType, setDraggedQuestionType] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  const questionTypes = [
    {
      id: "text",
      name: "Text Input",
      icon: Type,
      description: "Single line text input",
      color: "bg-blue-500",
    },
    {
      id: "textarea",
      name: "Long Text",
      icon: FileText,
      description: "Multi-line text area",
      color: "bg-blue-600",
    },
    {
      id: "dropdown",
      name: "Dropdown",
      icon: List,
      description: "Select from predefined options",
      color: "bg-green-500",
    },
    {
      id: "radio",
      name: "Multiple Choice",
      icon: CheckSquare,
      description: "Select one option",
      color: "bg-purple-500",
    },
    {
      id: "checkbox",
      name: "Checkboxes",
      icon: CheckSquare,
      description: "Select multiple options",
      color: "bg-purple-600",
    },
    {
      id: "rating",
      name: "Rating Scale",
      icon: Star,
      description: "1-5 star rating",
      color: "bg-yellow-500",
    },
    {
      id: "number",
      name: "Number",
      icon: Hash,
      description: "Numeric input",
      color: "bg-indigo-500",
    },
    {
      id: "date",
      name: "Date",
      icon: Calendar,
      description: "Date picker",
      color: "bg-red-500",
    },
    {
      id: "time",
      name: "Time",
      icon: Clock,
      description: "Time picker",
      color: "bg-red-600",
    },
    {
      id: "image",
      name: "Image Upload",
      icon: Camera,
      description: "Photo capture/upload",
      color: "bg-orange-500",
    },
    {
      id: "location",
      name: "Location",
      icon: MapPin,
      description: "GPS coordinates",
      color: "bg-teal-500",
    },
    {
      id: "phone",
      name: "Phone Number",
      icon: Phone,
      description: "Phone number input",
      color: "bg-cyan-500",
    },
    {
      id: "email",
      name: "Email",
      icon: Mail,
      description: "Email address input",
      color: "bg-pink-500",
    },
  ]

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
  }

  const updateSection = (sectionId: string, updates: Partial<Section>) => {
    setTemplate((prev) => ({
      ...prev,
      sections: prev.sections.map((section) => (section.id === sectionId ? { ...section, ...updates } : section)),
    }))
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

  const handleDragStart = (e: DragEvent, questionType: string) => {
    setDraggedQuestionType(questionType)
    e.dataTransfer.effectAllowed = "copy"
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

    // Add default options for dropdown/radio/checkbox
    if (["dropdown", "radio", "checkbox"].includes(draggedQuestionType)) {
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
            conditionalLogic: q.conditionalLogic || []
          }))
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
        category: initialTemplate?.category || "Store Visit",
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
      router.push("/")
    } catch (error) {
      console.error("Error saving template:", error)
      alert(`Error saving template: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsSaving(false)
    }
  }

  // Show preview if enabled
  if (showPreview) {
    return <TemplatePreview template={template} onClose={() => setShowPreview(false)} onSave={saveTemplate} />
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
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
            <Button variant="outline" size="sm" onClick={() => setShowPreview(true)}>
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
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  placeholder="e.g., Store Compliance Check"
                  value={template.name}
                  onChange={(e) => setTemplate((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="template-description">Description</Label>
                <Input
                  id="template-description"
                  placeholder="Brief description of this template"
                  value={template.description}
                  onChange={(e) => setTemplate((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Template Builder */}
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Add Section Button */}
              <div className="flex justify-center">
                <Button onClick={addSection} variant="outline" className="border-dashed border-2 bg-transparent">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Section
                </Button>
              </div>

              {/* Sections */}
              {template.sections.map((section, sectionIndex) => (
                <Card key={section.id} className={`${activeSection === section.id ? "ring-2 ring-blue-500" : ""}`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 space-y-2">
                        <Input
                          value={section.title}
                          onChange={(e) => updateSection(section.id, { title: e.target.value })}
                          className="font-semibold text-lg border-none p-0 h-auto focus-visible:ring-0"
                          placeholder="Section Title"
                        />
                        <Input
                          value={section.description || ""}
                          onChange={(e) => updateSection(section.id, { description: e.target.value })}
                          className="text-sm text-gray-600 border-none p-0 h-auto focus-visible:ring-0"
                          placeholder="Section description (optional)"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{section.questions.length} questions</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSection(section.id)}
                          className="text-red-600 hover:text-red-700"
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
                                        <Badge variant="secondary" className="text-xs">
                                          ⚡ Logic: {question.conditionalLogic.length}
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
    </div>
  )
}
