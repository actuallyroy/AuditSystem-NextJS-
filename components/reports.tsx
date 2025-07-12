"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/lib/auth-context"
import { reportsService, ReportTypeDto, TemplateDto, ReportResponseDto, GenerateReportDto } from "@/lib/reports-service"
import * as Icons from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"

export function Reports() {
  const { user, logout, handleTokenExpiration } = useAuth()
  const token = user?.token
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()

  // Additional filter states
  const [selectedRegion, setSelectedRegion] = useState<string>("all")
  const [selectedTemplate, setSelectedTemplate] = useState<string>("all")
  const [selectedFormat, setSelectedFormat] = useState<string>("pdf")

  // --- Queries --------------------------------------------------------------
  const {
    data: reportTypes = [],
    isLoading: reportTypesLoading,
    error: reportTypesError,
  } = useQuery({
    queryKey: ["reportTypes"],
    queryFn: () => reportsService.getReportTypes(token!, handleTokenExpiration),
    enabled: !!token,
    retry: false,
  })

  const { data: templates = [] } = useQuery({
    queryKey: ["templates"],
    queryFn: () => reportsService.getTemplates(token!, handleTokenExpiration),
    enabled: !!token,
    retry: false,
  })

  const {
    data: recentReports = [],
    refetch: refetchRecent,
    error: recentReportsError,
  } = useQuery({
    queryKey: ["recentReports"],
    queryFn: () => reportsService.getRecentReports(token!, handleTokenExpiration),
    enabled: !!token,
    retry: false,
  })

  // --- Helpers --------------------------------------------------------------
  const getIconComponent = (iconName: string) => {
    // Fallback to FileText if backend sends an unknown icon string
    return (
      (Icons as any)[iconName] || Icons.FileText
    )
  }

  async function handleDownload(reportId: string, reportName: string) {
    if (!token) {
      toast({
        title: "Authentication required",
        description: "Please login to download reports",
        variant: "destructive",
      })
      return
    }

    try {
      console.log("Downloading report:", reportId)
      
      const blob = await reportsService.downloadReport(reportId, token, handleTokenExpiration)
      
      // Create a download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${reportName}.${blob.type.includes('pdf') ? 'pdf' : blob.type.includes('excel') ? 'xlsx' : 'csv'}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Download started",
        description: "Your report is being downloaded",
      })
    } catch (error) {
      console.error("Failed to download report:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      toast({
        title: "Download failed",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  async function handleGenerate(reportTypeId: string) {
    if (!token) {
      toast({
        title: "Authentication required",
        description: "Please login to generate reports",
        variant: "destructive",
      })
      return
    }

    try {
      const reportData: GenerateReportDto = {
        reportType: reportTypeId,
        fromDate: dateFrom?.toISOString().slice(0, 10),
        toDate: dateTo?.toISOString().slice(0, 10),
        region: selectedRegion === "all" ? undefined : selectedRegion,
        templateId: selectedTemplate === "all" ? undefined : selectedTemplate,
        format: selectedFormat as "pdf" | "xlsx" | "csv",
      }

      console.log("Generating report:", reportData)

      await reportsService.generateReport(reportData, token, handleTokenExpiration)

      toast({
        title: "Report queued ✔️",
        description: "You will be notified once it is ready for download.",
      })

      // Refresh recent reports so the newly queued job appears
      refetchRecent()
    } catch (error) {
      console.error("Failed to generate report:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      toast({
        title: "Failed to queue report",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  // Check if user is authenticated
  if (!token) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
            <p className="text-gray-600">Generate and download audit reports</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Please login to access reports</p>
          </CardContent>
        </Card>
      </div>
    )
  }

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
                      <Icons.Calendar className="mr-2 h-4 w-4" />
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
                      <Icons.Calendar className="mr-2 h-4 w-4" />
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
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
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
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="All Templates" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Templates</SelectItem>
                  {templates.map((tpl: TemplateDto) => (
                    <SelectItem key={tpl.id} value={tpl.id}>
                      {tpl.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Format</label>
              <Select value={selectedFormat} onValueChange={setSelectedFormat}>
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
            {reportTypesLoading && <p className="text-gray-500">Loading report types...</p>}
            {reportTypesError && (
              <div className="col-span-2 p-4 border border-red-200 bg-red-50 rounded-lg">
                <p className="text-red-600 font-medium">Error loading report types:</p>
                <p className="text-red-500 text-sm mt-1">{reportTypesError.message}</p>
                <p className="text-gray-600 text-xs mt-2">API endpoint: /api/v1/reports/types</p>
              </div>
            )}
            {!reportTypesLoading && !reportTypesError &&
              reportTypes.map((report: ReportTypeDto) => {
                const Icon = getIconComponent(report.icon)
                return (
              <Card key={report.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${report.color}`}>
                          <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{report.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                          <Button className="mt-3 w-full bg-transparent" variant="outline" onClick={() => handleGenerate(report.id)}>
                            <Icons.Download className="h-4 w-4 mr-2" />
                        Generate Report
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
                )
              })}
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
            {recentReportsError && (
              <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                <p className="text-red-600 font-medium">Error loading recent reports:</p>
                <p className="text-red-500 text-sm mt-1">{recentReportsError.message}</p>
                <p className="text-gray-600 text-xs mt-2">API endpoint: /api/v1/reports/recent</p>
              </div>
            )}
            {recentReports.length === 0 && !recentReportsError && (
              <p className="text-gray-500 text-center py-8">No recent reports found</p>
            )}
            {recentReports.map((report: ReportResponseDto, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Icons.FileText className="h-8 w-8 text-gray-400" />
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
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownload(report.id, report.name)}
                  >
                    <Icons.Download className="h-4 w-4 mr-1" />
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
            <Icons.FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Downloaded</CardTitle>
            <Icons.TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Compliance</div>
            <p className="text-xs text-muted-foreground">Report type</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Generation Time</CardTitle>
            <Icons.BarChart3 className="h-4 w-4 text-muted-foreground" />
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
