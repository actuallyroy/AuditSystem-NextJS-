"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, Zap, ArrowRight, Eye, EyeOff, SkipForward } from "lucide-react"

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
}

interface ConditionalLogicPanelProps {
  question: Question
  allQuestions: Question[]
  sections: Section[]
  onUpdate: (updates: Partial<Question>) => void
}

export function ConditionalLogicPanel({ question, allQuestions, sections, onUpdate }: ConditionalLogicPanelProps) {
  const [showPanel, setShowPanel] = useState(false)
  
  const addConditionalLogic = () => {
    const newLogic: ConditionalLogic = {
      id: `logic-${Date.now()}`,
      sourceQuestionId: '',
      condition: 'equals',
      value: '',
      action: 'show',
      targetQuestionIds: [question.id]
    }
    
    const currentLogic = question.conditionalLogic || []
    onUpdate({
      conditionalLogic: [...currentLogic, newLogic]
    })
  }

  const updateConditionalLogic = (logicId: string, updates: Partial<ConditionalLogic>) => {
    const currentLogic = question.conditionalLogic || []
    const updatedLogic = currentLogic.map(logic => 
      logic.id === logicId ? { ...logic, ...updates } : logic
    )
    onUpdate({
      conditionalLogic: updatedLogic
    })
  }

  const removeConditionalLogic = (logicId: string) => {
    const currentLogic = question.conditionalLogic || []
    const updatedLogic = currentLogic.filter(logic => logic.id !== logicId)
    onUpdate({
      conditionalLogic: updatedLogic
    })
  }

  const getSourceQuestionOptions = () => {
    return allQuestions.filter(q => q.id !== question.id)
  }

  const getTargetQuestionOptions = () => {
    return allQuestions.filter(q => q.id !== question.id)
  }

  const getConditionOptions = (sourceQuestionType: string) => {
    const baseOptions = [
      { value: 'equals', label: 'Equals' },
      { value: 'not_equals', label: 'Not Equals' },
      { value: 'is_empty', label: 'Is Empty' },
      { value: 'is_not_empty', label: 'Is Not Empty' }
    ]

    if (['text', 'textarea'].includes(sourceQuestionType)) {
      return [
        ...baseOptions,
        { value: 'contains', label: 'Contains' },
        { value: 'not_contains', label: 'Does Not Contain' }
      ]
    }

    if (['number', 'rating'].includes(sourceQuestionType)) {
      return [
        ...baseOptions,
        { value: 'greater_than', label: 'Greater Than' },
        { value: 'less_than', label: 'Less Than' }
      ]
    }

    return baseOptions
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'show': return <Eye className="h-4 w-4" />
      case 'hide': return <EyeOff className="h-4 w-4" />
      case 'skip': return <SkipForward className="h-4 w-4" />
      default: return null
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'show': return 'bg-green-500'
      case 'hide': return 'bg-red-500'
      case 'skip': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const conditionalLogicCount = question.conditionalLogic?.length || 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-yellow-500" />
          <Label>Conditional Logic</Label>
          {conditionalLogicCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {conditionalLogicCount} rule{conditionalLogicCount !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={showPanel}
            onCheckedChange={setShowPanel}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={addConditionalLogic}
            disabled={!showPanel}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Rule
          </Button>
        </div>
      </div>

      {showPanel && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Conditional Logic Rules</CardTitle>
            <p className="text-xs text-gray-500">
              Control when this question is shown, hidden, or skipped based on answers to other questions
            </p>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-96">
              <div className="space-y-4">
                {question.conditionalLogic?.map((logic, index) => {
                  const sourceQuestion = allQuestions.find(q => q.id === logic.sourceQuestionId)
                  const conditionOptions = sourceQuestion ? getConditionOptions(sourceQuestion.type) : []
                  
                  return (
                    <Card key={logic.id} className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`p-1 rounded ${getActionColor(logic.action)}`}>
                              {getActionIcon(logic.action)}
                            </div>
                            <span className="text-sm font-medium">Rule {index + 1}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeConditionalLogic(logic.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid gap-3">
                          {/* Source Question */}
                          <div>
                            <Label className="text-xs">When question</Label>
                            <Select
                              value={logic.sourceQuestionId}
                              onValueChange={(value) => updateConditionalLogic(logic.id, { sourceQuestionId: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a question..." />
                              </SelectTrigger>
                              <SelectContent>
                                {getSourceQuestionOptions().map(q => (
                                  <SelectItem key={q.id} value={q.id}>
                                    {q.title}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Condition */}
                          <div>
                            <Label className="text-xs">Condition</Label>
                            <Select
                              value={logic.condition}
                              onValueChange={(value) => updateConditionalLogic(logic.id, { condition: value as any })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {conditionOptions.map(option => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Value */}
                          {!['is_empty', 'is_not_empty'].includes(logic.condition) && (
                            <div>
                              <Label className="text-xs">Value</Label>
                              {sourceQuestion && ['dropdown', 'radio'].includes(sourceQuestion.type) ? (
                                <Select
                                  value={logic.value?.toString() || ''}
                                  onValueChange={(value) => updateConditionalLogic(logic.id, { value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a value..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {sourceQuestion.options?.map(option => (
                                      <SelectItem key={option} value={option}>
                                        {option}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Input
                                  value={logic.value?.toString() || ''}
                                  onChange={(e) => updateConditionalLogic(logic.id, { value: e.target.value })}
                                  placeholder="Enter value..."
                                  type={sourceQuestion?.type === 'number' ? 'number' : 'text'}
                                />
                              )}
                            </div>
                          )}

                          {/* Action */}
                          <div>
                            <Label className="text-xs">Then</Label>
                            <Select
                              value={logic.action}
                              onValueChange={(value) => updateConditionalLogic(logic.id, { action: value as any })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="show">Show this question</SelectItem>
                                <SelectItem value="hide">Hide this question</SelectItem>
                                <SelectItem value="skip">Skip this question</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Logic Preview */}
                        {logic.sourceQuestionId && sourceQuestion && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <span className="font-medium">Preview:</span>
                              <span>When "{sourceQuestion.title}"</span>
                              <Badge variant="outline" className="text-xs">
                                {conditionOptions.find(opt => opt.value === logic.condition)?.label}
                              </Badge>
                              {!['is_empty', 'is_not_empty'].includes(logic.condition) && (
                                <span>"{logic.value}"</span>
                              )}
                              <ArrowRight className="h-3 w-3" />
                              <Badge className={`text-xs ${getActionColor(logic.action)}`}>
                                {logic.action} question
                              </Badge>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  )
                })}

                {(!question.conditionalLogic || question.conditionalLogic.length === 0) && (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg">
                    <Zap className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 mb-3">No conditional logic rules yet</p>
                    <Button variant="outline" onClick={addConditionalLogic}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Rule
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 