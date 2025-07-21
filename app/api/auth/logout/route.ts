import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { verifyAccessToken } from "@/lib/jwt"

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get("access_token")?.value
    const refreshToken = request.cookies.get("refresh_token")?.value

    let decodedPayload = null
    if (accessToken) {
      decodedPayload = verifyAccessToken(accessToken)
    }

    // Delete session from user_sessions table if access token exists
    if (accessToken) {
      const { error: deleteSessionError } = await supabaseAdmin
        .from("user_sessions")
        .delete()
        .eq("session_token", accessToken)

      if (deleteSessionError) {
        console.error("Database Error: Failed to delete user session on logout", deleteSessionError)
      } else if (decodedPayload) {
        console.log(`Session for user ${decodedPayload.email} (ID: ${decodedPayload.userId}) deleted successfully.`)
      }
    }

    // Delete refresh token from refresh_tokens table if it exists
    if (refreshToken && decodedPayload) {
      const { error: deleteRefreshTokenError } = await supabaseAdmin
        .from("refresh_tokens")
        .delete()
        .eq("token", refreshToken)
        .eq("user_id", decodedPayload.userId)

      if (deleteRefreshTokenError) {
        console.error("Database Error: Failed to delete refresh token on logout", deleteRefreshTokenError)
      } else {
        console.log(
          `Refresh token for user ${decodedPayload.email} (ID: ${decodedPayload.userId}) deleted successfully.`,
        )
      }
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
