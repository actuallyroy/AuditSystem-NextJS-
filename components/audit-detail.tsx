"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Flag, Star, Calendar, MapPin, User, FileText, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { auditService, AuditResponseDto } from "@/lib/audit-service"
import { useAuth } from "@/lib/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { templateService, Template, TemplateQuestions, TemplateQuestion } from "@/lib/template-service"

interface AuditDetailProps {
  auditId: string
  onBack: () => void
}

export function AuditDetail({ auditId, onBack }: AuditDetailProps) {
  const [audit, setAudit] = useState<AuditResponseDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [template, setTemplate] = useState<Template | null>(null)
  const [questions, setQuestions] = useState<TemplateQuestion[]>([])
  const { user, logout } = useAuth()
  const token = user?.token

  useEffect(() => {
    if (token && auditId) {
      fetchAuditDetail()
    }
  }, [token, auditId])

  const fetchAuditDetail = async () => {
    if (!token) return

    setLoading(true)
    setError(null)

    try {
      const auditData = await auditService.getAuditById(auditId, token, logout)
      setAudit(auditData)
      // Fetch template and questions
      if (auditData?.templateId) {
        const tpl = await templateService.getTemplateById(auditData.templateId, token, logout)
        setTemplate(tpl)
        // Parse questions JSON
        let parsed: TemplateQuestions | null = null
        try {
          parsed = typeof tpl.questions === 'string' ? JSON.parse(tpl.questions) : tpl.questions
        } catch {}
        if (parsed && parsed.sections) {
          setQuestions(parsed.sections.flatMap(section => section.questions))
        }
      }
    } catch (err) {
      console.error('Error fetching audit detail:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch audit details')
    } finally {
      setLoading(false)
    }
  }

  const handleFlagToggle = async () => {
    if (!token || !audit) return

    try {
      const updatedAudit = await auditService.flagAudit(auditId, !audit.isFlagged, token, logout)
      setAudit(updatedAudit)
    } catch (err) {
      console.error('Error toggling flag:', err)
      setError('Failed to update audit flag')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'in progress':
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'flagged':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getScoreColor = (score: number) => {
    return auditService.getScoreColor(score)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading audit details...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !audit) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            {error || 'Audit not found'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Audits
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Audit Details</h2>
            <p className="text-gray-600">Audit ID: {audit.auditId}</p>
          </div>
        </div>
        {/*
        <div className="flex items-center gap-2">
          {audit.isFlagged && <Flag className="h-5 w-5 text-red-500" />}
          <Button
            variant={audit.isFlagged ? "destructive" : "outline"}
            size="sm"
            onClick={handleFlagToggle}
          >
            <Flag className="h-4 w-4 mr-2" />
            {audit.isFlagged ? 'Unflag' : 'Flag'}
          </Button>
        </div>
        */}
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Audit Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Audit Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Template</label>
                <p className="text-sm">{audit.templateName || 'Unknown'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Version</label>
                <p className="text-sm">{audit.templateVersion || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="flex items-center gap-2">
                  {getStatusIcon(audit.status || '')}
                  <Badge variant={['default','destructive','outline','secondary'].includes(auditService.getStatusColor(audit.status || '')) ? auditService.getStatusColor(audit.status || '') as any : 'outline'}>
                    {audit.status || 'Unknown'}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Score</label>
                {audit.score ? (
                  <div className="flex items-center gap-1">
                    <Star className={`h-4 w-4 ${getScoreColor(audit.score)}`} />
                    <span className={`text-sm font-medium ${getScoreColor(audit.score)}`}>
                      {Math.round(audit.score)}%
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">Not scored</p>
                )}
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Critical Issues</label>
                <p className="text-sm font-medium">{audit.criticalIssues}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Sync Status</label>
                <Badge variant={audit.syncFlag ? "default" : "secondary"}>
                  {audit.syncFlag ? 'Synced' : 'Pending'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Auditor & Organization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Auditor & Organization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Auditor</label>
              <p className="text-sm">{audit.auditorName || 'Unknown'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Organization</label>
              <p className="text-sm">{audit.organisationName || 'Unknown'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Timing Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Timing Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Created</label>
                <p className="text-sm">{auditService.formatDate(audit.createdAt)}</p>
                <p className="text-xs text-gray-500">{auditService.formatTime(audit.createdAt)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Started</label>
                {audit.startTime ? (
                  <>
                    <p className="text-sm">{auditService.formatDate(audit.startTime)}</p>
                    <p className="text-xs text-gray-500">{auditService.formatTime(audit.startTime)}</p>
                  </>
                ) : (
                  <p className="text-sm text-gray-400">Not started</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Completed</label>
                {audit.endTime ? (
                  <>
                    <p className="text-sm">{auditService.formatDate(audit.endTime)}</p>
                    <p className="text-xs text-gray-500">{auditService.formatTime(audit.endTime)}</p>
                  </>
                ) : (
                  <p className="text-sm text-gray-400">Not completed</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Store Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Store Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            {audit.storeInfo ? (
              <div className="space-y-2">
                {Object.entries(audit.storeInfo).map(([key, value]) => (
                  <div key={key}>
                    <label className="text-sm font-medium text-gray-500 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <p className="text-sm">{String(value)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No store information available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Manager Notes */}
      {audit.managerNotes && (
        <Card>
          <CardHeader>
            <CardTitle>Manager Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{audit.managerNotes}</p>
          </CardContent>
        </Card>
      )}

      {/* Audit Responses (if available) */}
      {audit.responses && questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Audit Responses</CardTitle>
            <CardDescription>Question responses from the audit</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border">
                <thead>
                  <tr className="bg-muted">
                    <th className="p-2 text-left border-b">Question</th>
                    <th className="p-2 text-left border-b">Answer</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(audit.responses).map(([qid, resp]: any) => {
                    const q = questions.find(q => q.id === qid)
                    return (
                      <tr key={qid}>
                        <td className="p-2 border-b font-medium">{q ? q.text : qid}</td>
                        <td className="p-2 border-b">{resp.answer ?? ''}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex gap-4 mt-4">
              <Button
                variant="default"
                disabled={loading || audit.status === 'Approved'}
                onClick={async () => {
                  setLoading(true)
                  setError(null)
                  try {
                    const updated = await auditService.updateAuditStatus(auditId, { status: 'Approved' }, token!, logout)
                    setAudit(updated)
                  } catch (err) {
                    setError('Failed to approve audit')
                  } finally {
                    setLoading(false)
                  }
                }}
              >
                {loading && audit.status !== 'Denied' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Approve
              </Button>
              <Button
                variant="destructive"
                disabled={loading || audit.status === 'Denied'}
                onClick={async () => {
                  setLoading(true)
                  setError(null)
                  try {
                    const updated = await auditService.updateAuditStatus(auditId, { status: 'Denied' }, token!, logout)
                    setAudit(updated)
                  } catch (err) {
                    setError('Failed to deny audit')
                  } finally {
                    setLoading(false)
                  }
                }}
              >
                {loading && audit.status !== 'Approved' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Deny
              </Button>
            </div>
            {audit.status === 'Approved' && (
              <div className="mt-2 text-green-600 font-medium">Audit approved.</div>
            )}
            {audit.status === 'Denied' && (
              <div className="mt-2 text-red-600 font-medium">Audit denied.</div>
            )}
          </CardContent>
        </Card>
      )}
      {/* fallback: show JSON if no questions loaded */}
      {audit.responses && questions.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Audit Responses</CardTitle>
            <CardDescription>Question responses from the audit</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-50 p-4 rounded-md overflow-auto mb-4">
              {JSON.stringify(audit.responses, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 