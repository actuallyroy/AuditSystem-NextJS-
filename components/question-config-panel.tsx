"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Plus, Trash2, GripVertical, Zap } from "lucide-react"
import { ConditionalLogicPanel } from "@/components/conditional-logic-panel"

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

interface QuestionConfigPanelProps {
  question: Question
  allQuestions: Question[]
  sections: Section[]
  onUpdate: (updates: Partial<Question>) => void
  onClose: () => void
}

export function QuestionConfigPanel({ question, allQuestions, sections, onUpdate, onClose }: QuestionConfigPanelProps) {
  const [localQuestion, setLocalQuestion] = useState(question)
  const [showConditionalLogic, setShowConditionalLogic] = useState(false)

  // Reset local state when question prop changes
  useEffect(() => {
    setLocalQuestion(question)
  }, [question])

  const updateLocalQuestion = (updates: Partial<Question>) => {
    const updated = { ...localQuestion, ...updates }
    setLocalQuestion(updated)
    onUpdate(updates)
  }

  const addOption = () => {
    const newOptions = [...(localQuestion.options || []), `Option ${(localQuestion.options?.length || 0) + 1}`]
    updateLocalQuestion({ options: newOptions })
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(localQuestion.options || [])]
    newOptions[index] = value
    updateLocalQuestion({ options: newOptions })
  }

  const removeOption = (index: number) => {
    const newOptions = localQuestion.options?.filter((_, i) => i !== index) || []
    updateLocalQuestion({ options: newOptions })
  }

  const hasOptions = ["dropdown", "single_choice", "multiple_choice"].includes(question.type)
  const hasValidation = ["text", "numeric"].includes(question.type)
  const conditionalLogicCount = question.conditionalLogic?.length || 0

  return (
    <div className="w-80 bg-white border-l flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold">Question Settings</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {/* Basic Settings */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="question-title">Question Title</Label>
              <Input
                id="question-title"
                value={localQuestion.title}
                onChange={(e) => updateLocalQuestion({ title: e.target.value })}
                placeholder="Enter question title"
              />
            </div>

            <div>
              <Label htmlFor="question-description">Description (Optional)</Label>
              <Textarea
                id="question-description"
                value={localQuestion.description || ""}
                onChange={(e) => updateLocalQuestion({ description: e.target.value })}
                placeholder="Add helpful description or instructions"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Required Question</Label>
                <p className="text-sm text-gray-500">Must be answered to proceed</p>
              </div>
              <Switch
                checked={localQuestion.required}
                onCheckedChange={(checked) => updateLocalQuestion({ required: checked })}
              />
            </div>

            <div>
              <Label htmlFor="scoring">Scoring Weight</Label>
              <Select
                value={localQuestion.scoring?.toString() || "1"}
                onValueChange={(value) => updateLocalQuestion({ scoring: Number.parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Point</SelectItem>
                  <SelectItem value="2">2 Points</SelectItem>
                  <SelectItem value="3">3 Points</SelectItem>
                  <SelectItem value="5">5 Points</SelectItem>
                  <SelectItem value="10">10 Points</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Conditional Logic Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Conditional Logic</Label>
                <p className="text-sm text-gray-500">Control when this question is shown or hidden</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConditionalLogic(!showConditionalLogic)}
              >
                <Zap className="h-4 w-4 mr-2" />
                {conditionalLogicCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {conditionalLogicCount}
                  </Badge>
                )}
              </Button>
            </div>

            {showConditionalLogic && (
              <ConditionalLogicPanel
                question={localQuestion}
                allQuestions={allQuestions}
                sections={sections}
                onUpdate={updateLocalQuestion}
              />
            )}
          </div>

          {/* Options for dropdown, single_choice, multiple_choice */}
          {hasOptions && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Answer Options</Label>
                <Button variant="outline" size="sm" onClick={addOption}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Option
                </Button>
              </div>

              <div className="space-y-2">
                {localQuestion.options?.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    <Input
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {(!localQuestion.options || localQuestion.options.length === 0) && (
                <div className="text-center py-4 border-2 border-dashed rounded-lg">
                  <p className="text-sm text-gray-500">No options added yet</p>
                  <Button variant="link" onClick={addOption} className="text-sm">
                    Add your first option
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Validation Rules */}
          {hasValidation && (
            <div className="space-y-4">
              <Label>Validation Rules</Label>

              {question.type === "text" && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="min-length">Minimum Length</Label>
                    <Input
                      id="min-length"
                      type="number"
                      placeholder="0"
                      value={localQuestion.validation?.minLength || ""}
                      onChange={(e) =>
                        updateLocalQuestion({
                          validation: { ...localQuestion.validation, minLength: Number.parseInt(e.target.value) || 0 },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="max-length">Maximum Length</Label>
                    <Input
                      id="max-length"
                      type="number"
                      placeholder="No limit"
                      value={localQuestion.validation?.maxLength || ""}
                      onChange={(e) =>
                        updateLocalQuestion({
                          validation: {
                            ...localQuestion.validation,
                            maxLength: Number.parseInt(e.target.value) || undefined,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              )}

              {question.type === "numeric" && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="min-value">Minimum Value</Label>
                    <Input
                      id="min-value"
                      type="number"
                      value={localQuestion.validation?.min || ""}
                      onChange={(e) =>
                        updateLocalQuestion({
                          validation: {
                            ...localQuestion.validation,
                            min: Number.parseFloat(e.target.value) || undefined,
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="max-value">Maximum Value</Label>
                    <Input
                      id="max-value"
                      type="number"
                      value={localQuestion.validation?.max || ""}
                      onChange={(e) =>
                        updateLocalQuestion({
                          validation: {
                            ...localQuestion.validation,
                            max: Number.parseFloat(e.target.value) || undefined,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Special Settings for File Upload */}
          {question.type === "file_upload" && (
            <div className="space-y-4">
              <Label>File Upload Settings</Label>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Multiple Files</Label>
                  <p className="text-sm text-gray-500">Allow multiple file uploads</p>
                </div>
                <Switch
                  checked={localQuestion.validation?.multiple || false}
                  onCheckedChange={(checked) =>
                    updateLocalQuestion({
                      validation: { ...localQuestion.validation, multiple: checked },
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="max-files">Maximum Files</Label>
                <Input
                  id="max-files"
                  type="number"
                  min="1"
                  max="10"
                  value={localQuestion.validation?.maxFiles || 1}
                  onChange={(e) =>
                    updateLocalQuestion({
                      validation: { ...localQuestion.validation, maxFiles: Number.parseInt(e.target.value) || 1 },
                    })
                  }
                />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
