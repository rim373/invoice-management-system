// lib/validation/password-validation.ts
export const PASSWORD_VALIDATION = {
  MIN_LENGTH: 6,
  MAX_LENGTH: 128,
  REQUIRED_FIELDS: ['currentPassword', 'newPassword', 'confirmNewPassword'],
  
  // Error messages
  ERRORS: {
    CURRENT_PASSWORD_REQUIRED: "Current password is required.",
    NEW_PASSWORD_REQUIRED: "New password is required.",
    CONFIRM_PASSWORD_REQUIRED: "Password confirmation is required.",
    CURRENT_PASSWORD_EMPTY: "Current password cannot be empty.",
    NEW_PASSWORD_EMPTY: "New password cannot be empty.",
    PASSWORDS_DO_NOT_MATCH: "New password and confirmation do not match.",
    PASSWORD_TOO_SHORT: `New password must be at least ${6} characters long.`,
    PASSWORD_TOO_LONG: `New password must be less than ${128} characters long.`,
    CURRENT_PASSWORD_INCORRECT: "Current password is incorrect.",
    INVALID_JSON: "Invalid JSON format in request body.",
    UNAUTHORIZED: "Unauthorized",
    INTERNAL_SERVER_ERROR: "Internal server error.",
    FAILED_TO_VERIFY_PASSWORD: "Failed to verify current password.",
    FAILED_TO_CHANGE_PASSWORD: "Failed to change password."
  },

  // Success messages
  SUCCESS: {
    PASSWORD_CHANGED: "Password changed successfully."
  }
} as const

// Type for password change request
export interface PasswordChangeRequest {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

// Validation function for frontend
export function validatePasswordChange(data: PasswordChangeRequest): string[] {
  const errors: string[] = []

  // Check required fields
  if (!data.currentPassword) {
    errors.push(PASSWORD_VALIDATION.ERRORS.CURRENT_PASSWORD_REQUIRED)
  }
  
  if (!data.newPassword) {
    errors.push(PASSWORD_VALIDATION.ERRORS.NEW_PASSWORD_REQUIRED)
  }
  
  if (!data.confirmNewPassword) {
    errors.push(PASSWORD_VALIDATION.ERRORS.CONFIRM_PASSWORD_REQUIRED)
  }

  // Check for empty strings after trimming
  if (data.currentPassword && data.currentPassword.trim() === '') {
    errors.push(PASSWORD_VALIDATION.ERRORS.CURRENT_PASSWORD_EMPTY)
  }
  
  if (data.newPassword && data.newPassword.trim() === '') {
    errors.push(PASSWORD_VALIDATION.ERRORS.NEW_PASSWORD_EMPTY)
  }

  // Check password match
  if (data.newPassword && data.confirmNewPassword && data.newPassword !== data.confirmNewPassword) {
    errors.push(PASSWORD_VALIDATION.ERRORS.PASSWORDS_DO_NOT_MATCH)
  }

  // Check password length
  if (data.newPassword && data.newPassword.length < PASSWORD_VALIDATION.MIN_LENGTH) {
    errors.push(PASSWORD_VALIDATION.ERRORS.PASSWORD_TOO_SHORT)
  }

  if (data.newPassword && data.newPassword.length > PASSWORD_VALIDATION.MAX_LENGTH) {
    errors.push(PASSWORD_VALIDATION.ERRORS.PASSWORD_TOO_LONG)
  }

  return errors
}