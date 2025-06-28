"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Download, FileText, PieChart, BarChart3, TrendingUp, CalendarIcon } from "lucide-react"
import { format } from "date-fns"

export function Reports() {
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()

  const reportTypes = [
    {
      id: "compliance",
      name: "Compliance Report",
      description: "Overall compliance scores and trends by region",
      icon: PieChart,
      color: "bg-blue-500",
    },
    {
      id: "audit-summary",
      name: "Audit Summary",
      description: "Detailed summary of all audit activities",
      icon: FileText,
      color: "bg-green-500",
    },
    {
      id: "flagged-issues",
      name: "Flagged Issues",
      description: "Critical issues requiring immediate attention",
      icon: BarChart3,
      color: "bg-red-500",
    },
    {
      id: "performance",
      name: "Performance Report",
      description: "Auditor performance and productivity metrics",
      icon: TrendingUp,
      color: "bg-purple-500",
    },
  ]

  const recentReports = [
    {
      name: "Weekly Compliance Report",
      type: "Compliance",
      generatedDate: "2025-01-14",
      size: "2.4 MB",
      format: "PDF",
    },
    {
      name: "Monthly Audit Summary",
      type: "Summary",
      generatedDate: "2025-01-10",
      size: "1.8 MB",
      format: "XLSX",
    },
    {
      name: "Critical Issues Report",
      type: "Issues",
      generatedDate: "2025-01-12",
      size: "856 KB",
      format: "PDF",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
          <p className="text-gray-600">Generate and download audit reports</p>
        </div>
      </div>

      {/* Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle>Generate New Report</CardTitle>
          <CardDescription>Select report type and filters to generate a custom report</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Range</label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex-1 justify-start text-left font-normal bg-transparent">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, "MMM dd") : "From"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex-1 justify-start text-left font-normal bg-transparent">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, "MMM dd") : "To"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={dateTo} onSelect={setDateTo} />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Region</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All Regions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="north">North Delhi</SelectItem>
                  <SelectItem value="south">South Delhi</SelectItem>
                  <SelectItem value="east">East Delhi</SelectItem>
                  <SelectItem value="west">West Delhi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Template</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All Templates" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Templates</SelectItem>
                  <SelectItem value="compliance">Store Compliance Check</SelectItem>
                  <SelectItem value="display">Product Display Audit</SelectItem>
                  <SelectItem value="inventory">Inventory Check</SelectItem>
                  <SelectItem value="service">Customer Service Evaluation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Format</label>
              <Select defaultValue="pdf">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Report Types */}
          <div className="grid gap-4 md:grid-cols-2">
            {reportTypes.map((report) => (
              <Card key={report.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${report.color}`}>
                      <report.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{report.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                      <Button className="mt-3 w-full bg-transparent" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Generate Report
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>Previously generated reports available for download</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentReports.map((report, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-gray-400" />
                  <div>
                    <h4 className="font-medium">{report.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Badge variant="outline" className="text-xs">
                        {report.type}
                      </Badge>
                      <span>•</span>
                      <span>Generated on {report.generatedDate}</span>
                      <span>•</span>
                      <span>{report.size}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{report.format}</Badge>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reports Generated</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Downloaded</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Compliance</div>
            <p className="text-xs text-muted-foreground">Report type</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Generation Time</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3s</div>
            <p className="text-xs text-muted-foreground">Processing time</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
