"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Building2, Mail, Phone, ArrowLeft, CheckCircle, Loader2, AlertCircle, Shield } from "lucide-react"

interface AccountRecoveryPageProps {
  setAuthView: (view: "login" | "signup" | "reset" | "recovery") => void
}

export function AccountRecoveryPage({ setAuthView }: AccountRecoveryPageProps) {
  const [recoveryMethod, setRecoveryMethod] = useState<"email" | "phone">("email")
  const [contactInfo, setContactInfo] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // This is a placeholder for the actual API call to request account recovery
    try {
      // In a real implementation, we would call an API endpoint like:
      // await fetch(`${API_BASE_URL}/Auth/account-recovery`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ 
      //     method: recoveryMethod, 
      //     contactInfo: contactInfo 
      //   }),
      // });
      
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setIsSuccess(true)
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="flex items-center gap-2 p-3 bg-green-600 rounded-xl">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Recovery instructions sent</h1>
              <p className="text-gray-600">
                We've sent {recoveryMethod === "email" ? "an email" : "a text message"} with account recovery instructions
              </p>
            </div>
          </div>

          <Card className="shadow-sm border-gray-200">
            <CardContent className="pt-6 pb-6">
              <div className="space-y-4 text-center">
                <p className="text-gray-600">
                  {recoveryMethod === "email"
                    ? "If you don't receive an email within a few minutes, check your spam folder."
                    : "If you don't receive a text message within a few minutes, try again with a different recovery method."}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setAuthView("login")}
                >
                  Back to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="flex items-center gap-2 p-3 bg-blue-600 rounded-xl">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Account Recovery</h1>
            <p className="text-gray-600">Recover your account access</p>
          </div>
        </div>

        {error && (
          <Alert className="bg-red-50 text-red-900 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-sm font-medium text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <Card className="shadow-sm border-gray-200">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3">
                <Label>Select recovery method</Label>
                <RadioGroup
                  value={recoveryMethod}
                  onValueChange={(value) => setRecoveryMethod(value as "email" | "phone")}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="email" id="email" />
                    <Label htmlFor="email" className="flex flex-1 items-center cursor-pointer">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      Email recovery
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="phone" id="phone" />
                    <Label htmlFor="phone" className="flex flex-1 items-center cursor-pointer">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      Phone recovery
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactInfo">
                  {recoveryMethod === "email" ? "Email address" : "Phone number"}
                </Label>
                <div className="relative">
                  {recoveryMethod === "email" ? (
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  ) : (
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  )}
                  <Input
                    id="contactInfo"
                    type={recoveryMethod === "email" ? "email" : "tel"}
                    placeholder={
                      recoveryMethod === "email" ? "Enter your email address" : "Enter your phone number"
                    }
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Recover Account"
                )}
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  className="text-blue-600 hover:text-blue-700 flex items-center justify-center mx-auto"
                  onClick={() => setAuthView("login")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
