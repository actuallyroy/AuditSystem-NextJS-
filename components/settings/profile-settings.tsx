"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Camera, Save, User, Mail, Phone, Building, MapPin, Calendar, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { settingsService, UserProfile, UpdateProfileRequest } from "@/lib/settings-service"
import { toast } from "@/hooks/use-toast"

interface ProfileSettingsProps {
  userRole: "admin" | "manager" | "supervisor" | "auditor"
}

export function ProfileSettings({ userRole }: ProfileSettingsProps) {
  const { user, handleTokenExpiration } = useAuth()
  const [profileData, setProfileData] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form data for editing
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "Experienced retail audit manager with 8+ years in the industry.",
    department: "Operations",
    location: "Delhi, India",
    timezone: "Asia/Kolkata",
    language: "English",
  })

  // Fetch profile data
  const fetchProfileData = async () => {
    if (!user?.token || !user?.userId) {
      setError("No authentication token found")
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const response = await settingsService.getUserProfile(
        user.userId,
        user.token,
        handleTokenExpiration
      )

      setProfileData(response)
      
      // Initialize form data with profile data
      setFormData({
        firstName: response.firstName || "",
        lastName: response.lastName || "",
        email: response.email || "",
        phone: response.phone || "",
        bio: "Experienced retail audit manager with 8+ years in the industry.",
        department: "Operations",
        location: "Delhi, India",
        timezone: "Asia/Kolkata",
        language: "English",
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch profile data"
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

  // Save profile changes
  const handleSave = async () => {
    if (!user?.token || !user?.userId) {
      toast({
        title: "Error",
        description: "No authentication token found",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSaving(true)

      const updateData: UpdateProfileRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
      }

      const updatedProfile = await settingsService.updateUserProfile(
        user.userId,
        updateData,
        user.token,
        handleTokenExpiration
      )

      setProfileData(updatedProfile)
      setIsEditing(false)
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update profile"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Cancel editing
  const handleCancel = () => {
    if (profileData) {
      setFormData({
        firstName: profileData.firstName || "",
        lastName: profileData.lastName || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        bio: "Experienced retail audit manager with 8+ years in the industry.",
        department: "Operations",
        location: "Delhi, India",
        timezone: "Asia/Kolkata",
        language: "English",
      })
    }
    setIsEditing(false)
  }

  // Initial data fetch
  useEffect(() => {
    fetchProfileData()
  }, [user?.token, user?.userId])

  const stats = [
    { label: "Audits Completed", value: "156", icon: User },
    { label: "Templates Created", value: "12", icon: Building },
    { label: "Team Members", value: "8", icon: User },
    { label: "Years Experience", value: "8+", icon: Calendar },
  ]

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Loading profile data...</CardDescription>
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
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Error loading profile data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchProfileData} disabled={isLoading}>
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

  if (!profileData) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>No profile data available</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Manage your personal information and preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="text-lg">
                  {profileData.firstName?.[0] || "U"}
                  {profileData.lastName?.[0] || "S"}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                variant="outline"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-transparent"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">
                    {profileData.firstName} {profileData.lastName}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="default" className="capitalize">
                      {userRole}
                    </Badge>
                    <span className="text-sm text-gray-500">{formData.department}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button onClick={handleCancel} variant="outline" disabled={isSaving}>
                        Cancel
                      </Button>
                      <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  {profileData.email}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  {profileData.phone || "Phone not provided"}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  Joined {new Date(profileData.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

