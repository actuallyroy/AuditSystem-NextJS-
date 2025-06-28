"use client"
import { LoginPage } from "@/components/auth/login-page"
import { SignupPage } from "@/components/auth/signup-page"
import { ResetPasswordPage } from "@/components/auth/reset-password-page"
import { AccountRecoveryPage } from "@/components/auth/account-recovery-page"

interface AuthPagesProps {
  authView: "login" | "signup" | "reset" | "recovery"
  setAuthView: (view: "login" | "signup" | "reset" | "recovery") => void
  onAuthenticated: () => void
}

export function AuthPages({ authView, setAuthView, onAuthenticated }: AuthPagesProps) {
  const renderAuthPage = () => {
    switch (authView) {
      case "login":
        return <LoginPage setAuthView={setAuthView} onAuthenticated={onAuthenticated} />
      case "signup":
        return <SignupPage setAuthView={setAuthView} onAuthenticated={onAuthenticated} />
      case "reset":
        return <ResetPasswordPage setAuthView={setAuthView} />
      case "recovery":
        return <AccountRecoveryPage setAuthView={setAuthView} />
      default:
        return <LoginPage setAuthView={setAuthView} onAuthenticated={onAuthenticated} />
    }
  }

  return <div className="min-h-screen bg-gray-50">{renderAuthPage()}</div>
}
