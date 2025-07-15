import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-server"
import { supabaseAdmin } from "@/lib/supabase"
import { PASSWORD_VALIDATION, validatePasswordChange } from "@/lib/validation/password-validation"
import bcrypt from "bcryptjs"

// Shared password change logic
async function handlePasswordChange(request: NextRequest) {
  try {
    const user = await requireAuth() // Ensure user is authenticated
    
    // Add better error handling for JSON parsing
    let requestBody;
    try {
      requestBody = await request.json()
    } catch (jsonError) {
      console.error("JSON parsing error:", jsonError)
      return NextResponse.json({ 
        error: PASSWORD_VALIDATION.ERRORS.INVALID_JSON 
      }, { status: 400 })
    }

    const { currentPassword, newPassword, confirmNewPassword } = requestBody

    // Use centralized validation
    const validationErrors = validatePasswordChange({
      currentPassword,
      newPassword,
      confirmNewPassword
    })

    if (validationErrors.length > 0) {
      return NextResponse.json({ error: validationErrors[0] }, { status: 400 })
    }

    // Fetch user's current hashed password from the database
    const { data: userData, error: fetchError } = await supabaseAdmin
      .from("users")
      .select("password_hash")
      .eq("id", user.userId)
      .single()

    if (fetchError || !userData) {
      console.error("Database Error: Failed to fetch user for password change", fetchError)
      return NextResponse.json({ error: PASSWORD_VALIDATION.ERRORS.FAILED_TO_VERIFY_PASSWORD }, { status: 500 })
    }

    // Compare current password with the stored hash
    const isPasswordValid = await bcrypt.compare(currentPassword, userData.password_hash)

    if (!isPasswordValid) {
      return NextResponse.json({ error: PASSWORD_VALIDATION.ERRORS.CURRENT_PASSWORD_INCORRECT }, { status: 401 })
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10) // 10 salt rounds

    // Update the user's password in the database
    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({ password_hash: hashedNewPassword, updated_at: new Date().toISOString() })
      .eq("id", user.userId)

    if (updateError) {
      console.error("Database Error: Failed to update password", updateError)
      return NextResponse.json({ error: PASSWORD_VALIDATION.ERRORS.FAILED_TO_CHANGE_PASSWORD }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: PASSWORD_VALIDATION.SUCCESS.PASSWORD_CHANGED })
    
  } catch (error) {
    console.error("Password change error:", error)
    
    // Handle specific auth errors
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: PASSWORD_VALIDATION.ERRORS.UNAUTHORIZED }, { status: 401 })
    }
    
    return NextResponse.json({ error: PASSWORD_VALIDATION.ERRORS.INTERNAL_SERVER_ERROR }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    return await handlePasswordChange(request)
  } catch (error) {
    console.error("Change Password POST API Error:", error)
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: PASSWORD_VALIDATION.ERRORS.UNAUTHORIZED }, { status: 401 })
    }
    return NextResponse.json({ error: PASSWORD_VALIDATION.ERRORS.INTERNAL_SERVER_ERROR }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    return await handlePasswordChange(request)
  } catch (error) {
    console.error("Change Password PUT API Error:", error)
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: PASSWORD_VALIDATION.ERRORS.UNAUTHORIZED }, { status: 401 })
    }
    return NextResponse.json({ error: PASSWORD_VALIDATION.ERRORS.INTERNAL_SERVER_ERROR }, { status: 500 })
  }
}