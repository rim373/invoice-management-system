import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { verifyAccessToken } from "@/lib/jwt"

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get("access_token")?.value

    if (!accessToken) {
      return NextResponse.json({ error: "No access token found" }, { status: 400 })
    }

    // Verify the token to get user info, though not strictly needed for deletion
    // but good for logging/security checks
    const decoded = verifyAccessToken(accessToken)
    if (!decoded) {
      console.log("Logout Error: Invalid access token")
      const response = NextResponse.json({ error: "Invalid token" }, { status: 401 })
      response.cookies.delete("access_token")
      response.cookies.delete("refresh_token")
      return response
    }

    // Delete the specific session entry using the access token
    const { error: deleteError } = await supabaseAdmin.from("user_sessions").delete().eq("session_token", accessToken)

    if (deleteError) {
      console.error("Database Error: Failed to delete user session on logout", deleteError)
      // Even if deletion fails, proceed to clear cookies for client-side logout
    } else {
      console.log(`Session for user ${decoded.email} (ID: ${decoded.userId}) deleted successfully.`)
    }

    const response = NextResponse.json({ success: true })

    // Clear cookies
    response.cookies.delete("access_token")
    response.cookies.delete("refresh_token")

    return response
  } catch (error) {
    console.error("Logout Error: Unexpected server error", error)
    const response = NextResponse.json({ error: "Internal server error" }, { status: 500 })
    response.cookies.delete("access_token")
    response.cookies.delete("refresh_token")
    return response
  }
}
