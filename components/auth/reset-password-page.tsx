"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Building2, Mail, ArrowLeft, CheckCircle, Loader2, AlertCircle, User } from "lucide-react"

interface ResetPasswordPageProps {
  setAuthView: (view: "login" | "signup" | "reset" | "recovery") => void
}

export function ResetPasswordPage({ setAuthView }: ResetPasswordPageProps) {
  const [username, setUsername] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // This is a placeholder for the actual API call to request a password reset
    try {
      // In a real implementation, we would call an API endpoint like:
      // await fetch(`${API_BASE_URL}/Auth/request-password-reset`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ username }),
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
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="flex items-center gap-2 p-3 bg-green-600 rounded-xl">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Check your email</h1>
              <p className="text-gray-600">We've sent a password reset link to your email</p>
            </div>
          </div>

          <Card className="shadow-sm border-gray-200">
            <CardContent className="pt-6 pb-6">
              <div className="space-y-4 text-center">
                <p className="text-gray-600">
                  If you don't receive an email within a few minutes, please check your spam folder.
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
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reset your password</h1>
            <p className="text-gray-600">Enter your username to receive a reset link</p>
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
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
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
                  "Reset Password"
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
        
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Forgot your username?{" "}
            <Button
              type="button"
              variant="link"
              className="px-0 font-normal text-blue-600 hover:text-blue-700"
              onClick={() => setAuthView("recovery")}
            >
              Account Recovery
            </Button>
          </p>
        </div>
      </div>
    </div>
  )
}
