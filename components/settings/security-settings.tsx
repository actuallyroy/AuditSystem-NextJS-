"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Shield, Key, Smartphone, Eye, EyeOff, CheckCircle, AlertTriangle, Clock, Globe, Loader2, LogOut } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { settingsService, ChangePasswordRequest, SecuritySettings } from "@/lib/settings-service"
import { toast } from "@/hooks/use-toast"

interface SecuritySettingsProps {
  userRole: "admin" | "manager" | "supervisor" | "auditor"
}

export function SecuritySettings({ userRole }: SecuritySettingsProps) {
  const { user, handleTokenExpiration } = useAuth()
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings | null>(null)
  const [activeSessions, setActiveSessions] = useState<any[]>([])
  const [securityEvents, setSecurityEvents] = useState<any[]>([])

  // Fetch security data
  const fetchSecurityData = async () => {
    if (!user?.token) {
      setError("No authentication token found")
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Fetch security settings, active sessions, and security events in parallel
      const [settings, sessions, events] = await Promise.all([
        settingsService.getSecuritySettings(user.token, handleTokenExpiration),
        settingsService.getActiveSessions(user.token, handleTokenExpiration),
        settingsService.getSecurityEvents(user.token, handleTokenExpiration),
      ])

      setSecuritySettings(settings)
      setActiveSessions(sessions)
      setSecurityEvents(events)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch security data"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Change password
  const handleChangePassword = async () => {
    if (!user?.token || !user?.userId) {
      toast({
        title: "Error",
        description: "No authentication token found",
        variant: "destructive",
      })
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      })
      return
    }

    if (passwordStrength < 75) {
      toast({
        title: "Error",
        description: "Password is too weak. Please choose a stronger password.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsChangingPassword(true)

      const passwordRequest: ChangePasswordRequest = {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      }

      await settingsService.changePassword(
        user.userId,
        passwordRequest,
        user.token,
        handleTokenExpiration
      )

      // Clear form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setPasswordStrength(0)

      toast({
        title: "Success",
        description: "Password changed successfully",
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to change password"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsChangingPassword(false)
    }
  }

  // Update security settings
  const handleUpdateSecuritySettings = async (newSettings: Partial<SecuritySettings>) => {
    if (!user?.token || !securitySettings) {
      toast({
        title: "Error",
        description: "No authentication token found",
        variant: "destructive",
      })
      return
    }

    try {
      setIsUpdatingSettings(true)

      const updatedSettings = { ...securitySettings, ...newSettings }
      const response = await settingsService.updateSecuritySettings(
        updatedSettings,
        user.token,
        handleTokenExpiration
      )

      setSecuritySettings(response)
      toast({
        title: "Success",
        description: "Security settings updated successfully",
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update security settings"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsUpdatingSettings(false)
    }
  }

  // Revoke session
  const handleRevokeSession = async (sessionId: string) => {
    if (!user?.token) {
      toast({
        title: "Error",
        description: "No authentication token found",
        variant: "destructive",
      })
      return
    }

    try {
      await settingsService.revokeSession(sessionId, user.token, handleTokenExpiration)
      
      // Remove session from list
      setActiveSessions(prev => prev.filter(session => session.id !== sessionId))
      
      toast({
        title: "Success",
        description: "Session revoked successfully",
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to revoke session"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const calculatePasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength += 25
    if (/[A-Z]/.test(password)) strength += 25
    if (/[0-9]/.test(password)) strength += 25
    if (/[^A-Za-z0-9]/.test(password)) strength += 25
    return strength
  }

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData({ ...passwordData, [field]: value })
    if (field === "newPassword") {
      setPasswordStrength(calculatePasswordStrength(value))
    }
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 50) return "bg-red-500"
    if (passwordStrength < 75) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return "Very Weak"
    if (passwordStrength < 50) return "Weak"
    if (passwordStrength < 75) return "Good"
    return "Strong"
  }

  // Initial data fetch
  useEffect(() => {
    fetchSecurityData()
  }, [user?.token])

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Settings
            </CardTitle>
            <CardDescription>Loading security data...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Settings
            </CardTitle>
            <CardDescription>Error loading security data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchSecurityData} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Retry"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Settings
          </CardTitle>
          <CardDescription>Manage your account security and privacy settings</CardDescription>
        </CardHeader>
      </Card>

      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={passwordData.currentPassword}
                onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {passwordData.newPassword && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Password strength</span>
                  <span
                    className={`font-medium ${
                      passwordStrength >= 75
                        ? "text-green-600"
                        : passwordStrength >= 50
                          ? "text-yellow-600"
                          : "text-red-600"
                    }`}
                  >
                    {getPasswordStrengthText()}
                  </span>
                </div>
                <Progress value={passwordStrength} className="h-2" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={passwordData.confirmPassword}
                onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Button 
            onClick={handleChangePassword} 
            disabled={isChangingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
            className="w-full"
          >
            {isChangingPassword ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Changing Password...
              </>
            ) : (
              <>
                <Key className="mr-2 h-4 w-4" />
                Change Password
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Security Preferences */}
      {/*
      {securitySettings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Preferences
            </CardTitle>
            <CardDescription>Configure your security preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Two-Factor Authentication</Label>
                <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
              </div>
              <Switch
                checked={securitySettings.twoFactorEnabled}
                onCheckedChange={(checked) => handleUpdateSecuritySettings({ twoFactorEnabled: checked })}
                disabled={isUpdatingSettings}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Login Notifications</Label>
                <p className="text-sm text-gray-500">Get notified when someone logs into your account</p>
              </div>
              <Switch
                checked={securitySettings.loginNotifications}
                onCheckedChange={(checked) => handleUpdateSecuritySettings({ loginNotifications: checked })}
                disabled={isUpdatingSettings}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Device Management</Label>
                <p className="text-sm text-gray-500">Manage and monitor your active devices</p>
              </div>
              <Switch
                checked={securitySettings.deviceManagement}
                onCheckedChange={(checked) => handleUpdateSecuritySettings({ deviceManagement: checked })}
                disabled={isUpdatingSettings}
              />
            </div>
          </CardContent>
        </Card>
      )}
      */}

      {/* Active Sessions */}
      {/*
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Active Sessions
          </CardTitle>
          <CardDescription>Manage your active login sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Smartphone className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">{session.device}</div>
                    <div className="text-sm text-gray-500">{session.location}</div>
                    <div className="text-xs text-gray-400">{session.ipAddress}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {session.current && (
                    <Badge variant="default" className="text-xs">
                      Current
                    </Badge>
                  )}
                  <span className="text-sm text-gray-500">{session.lastActive}</span>
                  {!session.current && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRevokeSession(session.id)}
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      */}

      {/* Security Events */}
      {/*
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Recent Security Events
          </CardTitle>
          <CardDescription>Track recent security-related activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {securityEvents.map((event) => (
              <div key={event.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className={`p-2 rounded-lg ${
                  event.status === 'success' ? 'bg-green-100' : 'bg-yellow-100'
                }`}>
                  {event.status === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{event.event}</div>
                  <div className="text-sm text-gray-500">{event.ipAddress}</div>
                </div>
                <div className="text-sm text-gray-500">{event.timestamp}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      */}
    </div>
  )
}
