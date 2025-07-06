"use client"

import { ChevronDown, User, Settings, LogOut, Building, Shield } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"

interface UserProfileProps {
  onLogout?: () => void
  setActiveView?: (view: string) => void
  setSettingsTab?: (tab: string) => void
}

export function UserProfile({ onLogout, setActiveView, setSettingsTab }: UserProfileProps) {
  const { user } = useAuth()
  
  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!user) return "U"
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
  }

  // Format role for display (capitalize first letter)
  const formatRole = (role: string) => {
    if (!role) return ""
    return role.charAt(0).toUpperCase() + role.slice(1)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 px-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder-user.jpg" />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium">{user ? `${user.firstName} ${user.lastName}` : "User"}</p>
            <p className="text-xs text-gray-500">{user ? formatRole(user.role) : ""}</p>
          </div>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => { setActiveView && setActiveView('settings'); setSettingsTab && setSettingsTab('profile'); }}>
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { setActiveView && setActiveView('settings'); setSettingsTab && setSettingsTab('organization'); }}>
          <Building className="mr-2 h-4 w-4" />
          Organisation
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { setActiveView && setActiveView('settings'); setSettingsTab && setSettingsTab('security'); }}>
          <Shield className="mr-2 h-4 w-4" />
          Security
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
