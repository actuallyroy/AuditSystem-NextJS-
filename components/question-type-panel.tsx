"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"

interface QuestionType {
  id: string
  name: string
  icon: any
  description: string
  color: string
}

interface QuestionTypePanelProps {
  questionTypes: QuestionType[]
  onDragStart: (e: React.DragEvent, questionType: string) => void
}

export function QuestionTypePanel({ questionTypes, onDragStart }: QuestionTypePanelProps) {
  return (
    <div className="grid gap-3">
      {questionTypes.map((type) => (
        <Card
          key={type.id}
          draggable
          onDragStart={(e) => onDragStart(e, type.id)}
          className="cursor-grab hover:shadow-md transition-shadow active:cursor-grabbing"
        >
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${type.color}`}>
                <type.icon className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">{type.name}</h4>
                <p className="text-xs text-gray-500">{type.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
