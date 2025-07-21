import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { verifyRefreshToken, generateAccessToken, generateRefreshToken, REFRESH_TOKEN_EXPIRY } from "@/lib/jwt"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  try {
    const cookieStore = await cookies()
    const oldRefreshToken = cookieStore.get("refresh_token")?.value

    if (!oldRefreshToken) {
      console.log("Refresh Error: No refresh token provided")
      response.status = 401
      response.json({ error: "No refresh token" })
      return response
    }

    // Verify old refresh token
    const payload = verifyRefreshToken(oldRefreshToken)
    if (!payload) {
      console.log("Refresh Error: Invalid refresh token payload")
      response.status = 401
      response.json({ error: "Invalid refresh token" })
      // Clear cookies if refresh token is invalid
      response.cookies.delete("access_token")
      response.cookies.delete("refresh_token")
      return response
    }

    // Check if refresh token exists in database
    const { data: tokenRecord, error: tokenError } = await supabaseAdmin
      .from("refresh_tokens")
      .select("*")
      .eq("token", oldRefreshToken)
      .eq("user_id", payload.userId)
      .single()

    if (tokenError || !tokenRecord) {
      console.log("Database Error: Refresh token not found or invalid in DB", tokenError)
      response.status = 401
      response.json({ error: "Invalid refresh token" })
      // Clear cookies if refresh token is not found in DB
      response.cookies.delete("access_token")
      response.cookies.delete("refresh_token")
      return response
    }

    // Check if token is expired
    if (new Date(tokenRecord.expires_at) < new Date()) {
      console.log("Token Error: Refresh token expired in DB")
      await supabaseAdmin.from("refresh_tokens").delete().eq("token", oldRefreshToken) // Delete expired token
      response.status = 401
      response.json({ error: "Refresh token expired" })
      // Clear cookies if refresh token is expired
      response.cookies.delete("access_token")
      response.cookies.delete("refresh_token")
      return response
    }

    // --- Refresh Token Rotation ---
    // Delete the old refresh token from the database
    const { error: deleteOldTokenError } = await supabaseAdmin
      .from("refresh_tokens")
      .delete()
      .eq("token", oldRefreshToken)

    if (deleteOldTokenError) {
      console.error("Database Error: Failed to delete old refresh token", deleteOldTokenError)
      // Continue, but log the error. This is not critical enough to block the refresh.
    }

    // Generate new access token and new refresh token
    const newAccessToken = generateAccessToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      name: payload.name,
      company: payload.company,
    })
    const newRefreshToken = generateRefreshToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      name: payload.name,
      company: payload.company,
    })

    // Store the new refresh token in the database
    const { error: insertNewTokenError } = await supabaseAdmin.from("refresh_tokens").insert({
      user_id: payload.userId,
      token: newRefreshToken,
      expires_at: new Date(Date.now() + REFRESH_TOKEN_EXPIRY * 1000).toISOString(),
    })

    if (insertNewTokenError) {
      console.error("Database Error: Failed to store new refresh token", insertNewTokenError)
      response.status = 500
      response.json({ error: "Internal server error during new token storage" })
      // Clear cookies if new refresh token cannot be stored
      response.cookies.delete("access_token")
      response.cookies.delete("refresh_token")
      return response
    }
    // --- End Refresh Token Rotation ---

    // Update last activity for the user
    await supabaseAdmin.from("users").update({ last_activity: new Date().toISOString() }).eq("id", payload.userId)

    // Set new access token and new refresh token cookies
    response.status = 200
    response.json({ success: true })

    response.cookies.set("access_token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 60, // 30 minutes
    })

    response.cookies.set("refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: REFRESH_TOKEN_EXPIRY, // 7 days
    })

    console.log("Token refresh successful for user:", payload.email)
    return response
  } catch (error) {
    console.error("Refresh API Error: Unexpected server error", error)
    response.status = 500
    response.json({ error: "Internal server error" })
    // Ensure cookies are cleared on any unexpected error during refresh
    response.cookies.delete("access_token")
    response.cookies.delete("refresh_token")
    return response
  }
}
