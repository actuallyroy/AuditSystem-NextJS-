"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, ArrowRight, Save, Camera, MapPin, Upload, CheckCircle, AlertCircle, FileText, Edit3, BarChart3 } from "lucide-react"

interface ConditionalLogic {
  id: string
  sourceQuestionId: string
  condition: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty'
  value: string | number | boolean
  action: 'show' | 'hide'
  targetSectionId: string
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
  sections: Section[]
}

interface TemplatePreviewProps {
  template: Template
  onClose: () => void
  onSave: () => void
}

export function TemplatePreview({ template, onClose, onSave }: TemplatePreviewProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [visibleSections, setVisibleSections] = useState<string[]>([])

  // Calculate which sections should be visible based on conditional logic
  useEffect(() => {
    const calculateVisibleSections = () => {
      const visible: string[] = []
      
      template.sections.forEach(section => {
        let shouldShow = true
        
        if (section.conditionalLogic && section.conditionalLogic.length > 0) {
          // Check all conditional logic rules for this section
          for (const logic of section.conditionalLogic) {
            const conditionMet = evaluateCondition(logic, answers)
            
            if (conditionMet) {
              shouldShow = logic.action === 'show'
              break // First matching condition wins
            }
          }
        }
        
        if (shouldShow) {
          visible.push(section.id)
        }
      })
      
      setVisibleSections(visible)
    }
    
    calculateVisibleSections()
  }, [answers, template.sections])

  // Get current visible sections
  const visibleSectionsList = template.sections.filter(section => 
    visibleSections.includes(section.id)
  )
  
  const currentSection = visibleSectionsList[currentSectionIndex]
  const totalSections = visibleSectionsList.length
  const progress = totalSections > 0 ? ((currentSectionIndex + 1) / totalSections) * 100 : 0

  const updateAnswer = (questionId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
    // Clear error when user provides an answer
    if (errors[questionId]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[questionId]
        return newErrors
      })
    }
  }

  // Section-level conditional logic evaluation
  const evaluateCondition = (condition: ConditionalLogic, answers: Record<string, any>): boolean => {
    const sourceValue = answers[condition.sourceQuestionId]
    const targetValue = condition.value

    switch (condition.condition) {
      case 'equals':
        return sourceValue === targetValue
      case 'not_equals':
        return sourceValue !== targetValue
      case 'contains':
        return sourceValue && sourceValue.toString().toLowerCase().includes(targetValue.toString().toLowerCase())
      case 'not_contains':
        return !sourceValue || !sourceValue.toString().toLowerCase().includes(targetValue.toString().toLowerCase())
      case 'greater_than':
        return Number(sourceValue) > Number(targetValue)
      case 'less_than':
        return Number(sourceValue) < Number(targetValue)
      case 'is_empty':
        return !sourceValue || sourceValue === '' || (Array.isArray(sourceValue) && sourceValue.length === 0)
      case 'is_not_empty':
        return sourceValue && sourceValue !== '' && (!Array.isArray(sourceValue) || sourceValue.length > 0)
      default:
        return false
    }
  }

  const validateCurrentSection = () => {
    const newErrors: Record<string, string> = {}

    if (!currentSection) return true

    currentSection.questions.forEach((question) => {
      if (question.required && (!answers[question.id] || answers[question.id] === "")) {
        newErrors[question.id] = "This field is required"
      }

      // Additional validation based on question type
      if (answers[question.id] && question.validation) {
        const value = answers[question.id]

        if (question.type === "text") {
          if (question.validation.minLength && value.length < question.validation.minLength) {
            newErrors[question.id] = `Minimum ${question.validation.minLength} characters required`
          }
          if (question.validation.maxLength && value.length > question.validation.maxLength) {
            newErrors[question.id] = `Maximum ${question.validation.maxLength} characters allowed`
          }
        }

        if (question.type === "numeric") {
          const numValue = Number.parseFloat(value)
          if (question.validation.min !== undefined && numValue < question.validation.min) {
            newErrors[question.id] = `Minimum value is ${question.validation.min}`
          }
          if (question.validation.max !== undefined && numValue > question.validation.max) {
            newErrors[question.id] = `Maximum value is ${question.validation.max}`
          }
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const goToNextSection = () => {
    if (validateCurrentSection() && currentSectionIndex < totalSections - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1)
    }
  }

  const goToPreviousSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1)
    }
  }

  const submitAudit = () => {
    if (validateCurrentSection()) {
      console.log("Audit submitted:", answers)
      alert("Audit submitted successfully!")
    }
  }

  const renderQuestion = (question: Question) => {
    const hasError = !!errors[question.id]
    const value = answers[question.id] || ""

    const questionContent = (
      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <Label className="text-base font-medium">
              {question.title}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {question.description && <p className="text-sm text-gray-600 mt-1">{question.description}</p>}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {question.scoring} pt{question.scoring !== 1 ? "s" : ""}
            </Badge>
          </div>
        </div>

        {/* Render different input types based on spec */}
        {question.type === "text" && (
          <Input
            value={value}
            onChange={(e) => updateAnswer(question.id, e.target.value)}
            placeholder="Enter your answer..."
            className={hasError ? "border-red-500" : ""}
          />
        )}

        {question.type === "numeric" && (
          <Input
            type="number"
            value={value}
            onChange={(e) => updateAnswer(question.id, e.target.value)}
            placeholder="Enter a number..."
            min={question.validation?.min}
            max={question.validation?.max}
            className={hasError ? "border-red-500" : ""}
          />
        )}

        {question.type === "single_choice" && (
          <RadioGroup value={value} onValueChange={(val) => updateAnswer(question.id, val)}>
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.id}-${index}`} />
                <Label htmlFor={`${question.id}-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {question.type === "multiple_choice" && (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${index}`}
                  checked={(value || []).includes(option)}
                  onCheckedChange={(checked) => {
                    const currentValues = value || []
                    if (checked) {
                      updateAnswer(question.id, [...currentValues, option])
                    } else {
                      updateAnswer(
                        question.id,
                        currentValues.filter((v: string) => v !== option),
                      )
                    }
                  }}
                />
                <Label htmlFor={`${question.id}-${index}`}>{option}</Label>
              </div>
            ))}
          </div>
        )}

        {question.type === "dropdown" && (
          <Select value={value} onValueChange={(val) => updateAnswer(question.id, val)}>
            <SelectTrigger className={hasError ? "border-red-500" : ""}>
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {question.type === "date_time" && (
          <Input
            type="date"
            value={value}
            onChange={(e) => updateAnswer(question.id, e.target.value)}
            className={hasError ? "border-red-500" : ""}
          />
        )}

        {question.type === "file_upload" && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">Click to upload image or take photo</p>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Choose File
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Maximum file size: 10MB
            </p>
          </div>
        )}

        {question.type === "barcode" && (
          <div className="border border-gray-300 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Barcode Scanner</span>
            </div>
            <Button variant="outline" size="sm">
              Scan Barcode
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Tap to open camera and scan barcode
            </p>
          </div>
        )}

        {question.type === "signature" && (
          <div className="border border-gray-300 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Edit3 className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Digital Signature</span>
            </div>
            <div className="h-32 bg-gray-50 border border-dashed border-gray-300 rounded flex items-center justify-center">
              <span className="text-gray-500 text-sm">Tap to sign</span>
            </div>
          </div>
        )}

        {question.type === "gps" && (
          <div className="border border-gray-300 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">GPS Location</span>
            </div>
            <Button variant="outline" size="sm">
              Get Current Location
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Location will be automatically captured
            </p>
          </div>
        )}

        {hasError && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            {errors[question.id]}
          </div>
        )}
      </div>
    )

    return (
      <Card key={question.id} className={`${hasError ? "border-red-200" : ""}`}>
        <CardContent className="p-6">{questionContent}</CardContent>
      </Card>
    )
  }

  if (!template.name) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Template to Preview</h3>
            <p className="text-gray-600 mb-4">Please add a template name and sections to preview.</p>
            <Button onClick={onClose}>Back to Builder</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If no sections are visible due to conditional logic
  if (totalSections === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Sections Available</h3>
            <p className="text-gray-600 mb-4">All sections are hidden based on conditional logic.</p>
            <Button onClick={onClose}>Back to Builder</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Builder
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="text-xl font-semibold">Template Preview</h1>
              <p className="text-sm text-gray-500">See how your template will look to auditors</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">Preview Mode</Badge>
            <Button onClick={onSave} className="bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              Save Template
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b px-6 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            Section {currentSectionIndex + 1} of {totalSections}
          </span>
          <span className="text-sm text-gray-600">{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-6">
          {/* Template Header */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl">{template.name}</CardTitle>
              {template.description && <p className="text-gray-600">{template.description}</p>}
            </CardHeader>
          </Card>

          {/* Current Section */}
          {currentSection && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {currentSection.title}
                  <Badge variant="secondary">{currentSection.questions.length} questions</Badge>
                  {currentSection.conditionalLogic && currentSection.conditionalLogic.length > 0 && (
                    <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-800 border-yellow-200">
                      Conditional
                    </Badge>
                  )}
                </CardTitle>
                {currentSection.description && <p className="text-gray-600">{currentSection.description}</p>}
              </CardHeader>
            </Card>
          )}

          {/* Questions */}
          <div className="space-y-6 mb-8">
            {currentSection?.questions.map((question) => renderQuestion(question))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={goToPreviousSection} disabled={currentSectionIndex === 0}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous Section
            </Button>

            <div className="flex items-center gap-2">
              {visibleSectionsList.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index === currentSectionIndex
                      ? "bg-blue-600"
                      : index < currentSectionIndex
                        ? "bg-green-500"
                        : "bg-gray-300"
                  }`}
                />
              ))}
            </div>

            {currentSectionIndex === totalSections - 1 ? (
              <Button onClick={submitAudit} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                Submit Audit
              </Button>
            ) : (
              <Button onClick={goToNextSection}>
                Next Section
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
