"use client"

import type React from "react"

import { useState } from "react"
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

interface CreateAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateAssignmentDialog({ open, onOpenChange }: CreateAssignmentDialogProps) {
  const [formData, setFormData] = useState({
    template: "",
    auditor: "",
    storeName: "",
    storeAddress: "",
    dueDate: "",
    priority: "",
    notes: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Creating assignment:", formData)
    // Here you would typically save to your backend
    onOpenChange(false)
    // Reset form
    setFormData({
      template: "",
      auditor: "",
      storeName: "",
      storeAddress: "",
      dueDate: "",
      priority: "",
      notes: "",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Assignment</DialogTitle>
          <DialogDescription>Assign an audit template to an auditor for a specific store.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="template">Template</Label>
                <Select
                  value={formData.template}
                  onValueChange={(value) => setFormData({ ...formData, template: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="store-compliance">Store Compliance Check</SelectItem>
                    <SelectItem value="product-display">Product Display Audit</SelectItem>
                    <SelectItem value="inventory-check">Inventory Check</SelectItem>
                    <SelectItem value="customer-service">Customer Service Evaluation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="auditor">Auditor</Label>
                <Select
                  value={formData.auditor}
                  onValueChange={(value) => setFormData({ ...formData, auditor: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select auditor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rajesh-kumar">Rajesh Kumar</SelectItem>
                    <SelectItem value="priya-sharma">Priya Sharma</SelectItem>
                    <SelectItem value="amit-singh">Amit Singh</SelectItem>
                    <SelectItem value="neha-patel">Neha Patel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="storeName">Store Name</Label>
              <Input
                id="storeName"
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                placeholder="e.g., Metro Store - Downtown"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storeAddress">Store Address</Label>
              <Input
                id="storeAddress"
                value={formData.storeAddress}
                onChange={(e) => setFormData({ ...formData, storeAddress: e.target.value })}
                placeholder="e.g., 123 Main Street, Delhi"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
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
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Assignment</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
