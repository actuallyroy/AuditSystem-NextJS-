"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { authService, AuthResponse, UserDetails } from "./auth-service"

// Define the shape of the auth context
interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  user: AuthResponse | null
  userDetails: UserDetails | null
  login: (username: string, password: string) => Promise<void>
  register: (userData: {
    username: string
    firstName: string
    lastName: string
    email: string
    phone: string
    password: string
    organisationId?: string
  }) => Promise<void>
  logout: () => void
  error: string | null
  clearError: () => void
}

// Create the auth context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<AuthResponse | null>(null)
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Clear error
  const clearError = () => setError(null)

  // Check if user is authenticated on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem("auth_user")
        if (!storedUser) {
          setIsLoading(false)
          return
        }

        const parsedUser = JSON.parse(storedUser) as AuthResponse
        setUser(parsedUser)
        setIsAuthenticated(true)

        // Fetch user details
        try {
          const details = await authService.getUserDetails(parsedUser.userId, parsedUser.token)
          setUserDetails(details)
        } catch (err) {
          console.error("Failed to fetch user details", err)
        }
      } catch (err) {
        console.error("Error checking authentication status", err)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Login function
  const login = async (username: string, password: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await authService.login({ username, password })
      setUser(response)
      setIsAuthenticated(true)
      localStorage.setItem("auth_user", JSON.stringify(response))
      
      // Fetch user details
      const details = await authService.getUserDetails(response.userId, response.token)
      setUserDetails(details)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Register function
  const register = async (userData: {
    username: string
    firstName: string
    lastName: string
    email: string
    phone: string
    password: string
    organisationId?: string
  }) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await authService.register(userData)
      setUser(response)
      setIsAuthenticated(true)
      localStorage.setItem("auth_user", JSON.stringify(response))
      
      // Fetch user details
      const details = await authService.getUserDetails(response.userId, response.token)
      setUserDetails(details)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed")
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem("auth_user")
    setUser(null)
    setUserDetails(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        userDetails,
        login,
        register,
        logout,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
} 