"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { Edit, LogOut, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { validatePasswordChange, PASSWORD_VALIDATION } from "@/lib/validation/password-validation"

interface HeaderProps {
  userRole: "admin" | "user"
  userData: any
  onLogout: () => void
}

export function Header({ userRole, userData, onLogout }: HeaderProps) {
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [touched, setTouched] = useState({
    currentPassword: false,
    newPassword: false,
    confirmNewPassword: false
  })
  const { toast } = useToast()

  // Validate form with touched state consideration
  const validateForm = () => {
    const errors: string[] = []
    
    // Check required fields only if they've been touched
    if (touched.currentPassword && !currentPassword) {
      errors.push("Current password is required.")
    }
    if (touched.newPassword && !newPassword) {
      errors.push("New password is required.")
    }
    if (touched.confirmNewPassword && !confirmNewPassword) {
      errors.push("Password confirmation is required.")
    }
    
    // Check for empty strings after trimming
    if (currentPassword && currentPassword.trim() === '') {
      errors.push("Current password cannot be empty.")
    }
    if (newPassword && newPassword.trim() === '') {
      errors.push("New password cannot be empty.")
    }
    
    // Check password length
    if (newPassword && newPassword.length < PASSWORD_VALIDATION.MIN_LENGTH) {
      errors.push(`New password must be at least ${PASSWORD_VALIDATION.MIN_LENGTH} characters long.`)
    }
    if (newPassword && newPassword.length > PASSWORD_VALIDATION.MAX_LENGTH) {
      errors.push(`New password must be less than ${PASSWORD_VALIDATION.MAX_LENGTH} characters long.`)
    }
    
    // Only check password match if both fields have values AND confirmNewPassword has been touched
    if (newPassword && confirmNewPassword && touched.confirmNewPassword && newPassword !== confirmNewPassword) {
      errors.push("New password and confirmation do not match.")
    }
    
    setValidationErrors(errors)
    return errors.length === 0
  }

  // Use effect to validate when values change
  useEffect(() => {
    if (touched.currentPassword || touched.newPassword || touched.confirmNewPassword) {
      const timeoutId = setTimeout(validateForm, 300)
      return () => clearTimeout(timeoutId)
    }
  }, [currentPassword, newPassword, confirmNewPassword, touched])

  // Handle input changes with touched state
  const handleCurrentPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentPassword(e.target.value)
    setTouched(prev => ({ ...prev, currentPassword: true }))
  }

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value)
    setTouched(prev => ({ ...prev, newPassword: true }))
  }

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmNewPassword(e.target.value)
    setTouched(prev => ({ ...prev, confirmNewPassword: true }))
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Mark all fields as touched for final validation
    setTouched({
      currentPassword: true,
      newPassword: true,
      confirmNewPassword: true
    })
    
    // Final validation before submission
    const finalValidation = validatePasswordChange({
      currentPassword,
      newPassword,
      confirmNewPassword
    })
    
    if (finalValidation.length > 0) {
      setValidationErrors(finalValidation)
      toast({
        title: "Validation Error",
        description: "Please fix the errors before submitting.",
        variant: "destructive",
      })
      return
    }

    setIsChangingPassword(true)

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentPassword, newPassword, confirmNewPassword }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: data.message,
        })
        setOpenPasswordDialog(false)
        setCurrentPassword("")
        setNewPassword("")
        setConfirmNewPassword("")
        setValidationErrors([])
        setTouched({
          currentPassword: false,
          newPassword: false,
          confirmNewPassword: false
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to change password.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Password change network error:", error)
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsChangingPassword(false)
    }
  }

  // Reset form when dialog opens/closes
  const handleDialogChange = (open: boolean) => {
    setOpenPasswordDialog(open)
    if (!open) {
      setCurrentPassword("")
      setNewPassword("")
      setConfirmNewPassword("")
      setValidationErrors([])
      setTouched({
        currentPassword: false,
        newPassword: false,
        confirmNewPassword: false
      })
    }
  }

  // Get field-specific error
  const getFieldError = (field: string) => {
    return validationErrors.find(error => {
      switch (field) {
        case 'currentPassword':
          return error.includes('Current password')
        case 'newPassword':
          return (error.includes('New password') && !error.includes('confirmation') && !error.includes('do not match')) ||
                 error.includes('characters long')
        case 'confirmPassword':
          return error.includes('Password confirmation') || error.includes('do not match')
        default:
          return false
      }
    })
  }

  return (
    <header className="bg-white shadow-sm border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Good Morning, {userData?.name} ✨</h1>
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 lg:h-auto lg:w-auto lg:px-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userData?.image || "/placeholder.svg"} alt={userData?.name} />
                  <AvatarFallback>
                    {userData?.name
                      ?.split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <span className="sr-only lg:not-sr-only ml-2">{userData?.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setOpenPasswordDialog(true)} className="flex items-center">
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit Password</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="text-red-600 flex items-center">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <Dialog open={openPasswordDialog} onOpenChange={handleDialogChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and a new password to update your account.
            </DialogDescription>
          </DialogHeader>
          
          {/* Display validation errors */}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              <div className="flex items-start">
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm text-red-700">
                  <ul className="space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Current Password"
                value={currentPassword}
                onChange={handleCurrentPasswordChange}
                className={getFieldError('currentPassword') ? 'border-red-500 focus:border-red-500' : ''}
                required
              />
              {getFieldError('currentPassword') && (
                <p className="text-sm text-red-600">{getFieldError('currentPassword')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={handleNewPasswordChange}
                className={getFieldError('newPassword') ? 'border-red-500 focus:border-red-500' : ''}
                required
              />
              {getFieldError('newPassword') && (
                <p className="text-sm text-red-600">{getFieldError('newPassword')}</p>
              )}
              <p className="text-xs text-gray-500">
                Password must be {PASSWORD_VALIDATION.MIN_LENGTH}-{PASSWORD_VALIDATION.MAX_LENGTH} characters long
              </p>
            </div>

            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Confirm New Password"
                value={confirmNewPassword}
                onChange={handleConfirmPasswordChange}
                className={getFieldError('confirmPassword') ? 'border-red-500 focus:border-red-500' : ''}
                required
              />
              {getFieldError('confirmPassword') && (
                <p className="text-sm text-red-600">{getFieldError('confirmPassword')}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isChangingPassword || validationErrors.length > 0}
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </header>
  )
}