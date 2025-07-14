import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-server"
import { supabaseAdmin } from "@/lib/supabase"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth() // Ensure user is authenticated
    const { currentPassword, newPassword, confirmNewPassword } = await request.json()

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 })
    }

    if (newPassword !== confirmNewPassword) {
      return NextResponse.json({ error: "New password and confirmation do not match." }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "New password must be at least 6 characters long." }, { status: 400 })
    }

    // Fetch user's current hashed password from the database
    const { data: userData, error: fetchError } = await supabaseAdmin
      .from("users")
      .select("password_hash")
      .eq("id", user.userId)
      .single()

    if (fetchError || !userData) {
      console.error("Database Error: Failed to fetch user for password change", fetchError)
      return NextResponse.json({ error: "Failed to verify current password." }, { status: 500 })
    }

    // Compare current password with the stored hash
    const isPasswordValid = await bcrypt.compare(currentPassword, userData.password_hash)

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 })
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
      return NextResponse.json({ error: "Failed to change password." }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Password changed successfully." })
  } catch (error) {
    console.error("Change Password API Error:", error)
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Internal server error." }, { status: 500 })
  }
}
