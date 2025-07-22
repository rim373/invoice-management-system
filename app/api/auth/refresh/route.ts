import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import {
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
  REFRESH_TOKEN_EXPIRY,
} from "@/lib/jwt"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const oldRefreshToken = cookieStore.get("refresh_token")?.value

    if (!oldRefreshToken) {
      console.log("Refresh Error: No refresh token provided")
      const res = NextResponse.json({ error: "No refresh token" }, { status: 401 })
      res.cookies.delete("access_token")
      res.cookies.delete("refresh_token")
      return res
    }

    // Verify old refresh token
    const payload = verifyRefreshToken(oldRefreshToken)
    if (!payload) {
      console.log("Refresh Error: Invalid refresh token payload")
      const res = NextResponse.json({ error: "Invalid refresh token" }, { status: 401 })
      res.cookies.delete("access_token")
      res.cookies.delete("refresh_token")
      return res
    }

    // Check if refresh token exists in DB
    const { data: tokenRecord, error: tokenError } = await supabaseAdmin
      .from("refresh_tokens")
      .select("*")
      .eq("token", oldRefreshToken)
      .eq("user_id", payload.userId)
      .single()

    if (tokenError || !tokenRecord) {
      console.log("Database Error: Refresh token not found in DB", tokenError)
      const res = NextResponse.json({ error: "Invalid refresh token" }, { status: 401 })
      res.cookies.delete("access_token")
      res.cookies.delete("refresh_token")
      return res
    }

    // Expired?
    if (new Date(tokenRecord.expires_at) < new Date()) {
      console.log("Token Error: Refresh token expired")
      await supabaseAdmin.from("refresh_tokens").delete().eq("token", oldRefreshToken)
      const res = NextResponse.json({ error: "Refresh token expired" }, { status: 401 })
      res.cookies.delete("access_token")
      res.cookies.delete("refresh_token")
      return res
    }

    // Refresh token rotation
    const { error: deleteOldTokenError } = await supabaseAdmin
      .from("refresh_tokens")
      .delete()
      .eq("token", oldRefreshToken)

    if (deleteOldTokenError) {
      console.error("Warning: Could not delete old refresh token", deleteOldTokenError)
    }

    const newAccessToken = generateAccessToken(payload)
    const newRefreshToken = generateRefreshToken(payload)

    const { error: insertNewTokenError } = await supabaseAdmin.from("refresh_tokens").insert({
      user_id: payload.userId,
      token: newRefreshToken,
      expires_at: new Date(Date.now() + REFRESH_TOKEN_EXPIRY * 1000).toISOString(),
    })

    if (insertNewTokenError) {
      console.error("Database Error: Failed to store new refresh token", insertNewTokenError)
      const errorResponse = NextResponse.json(
        { error: "Internal server error during new token storage" },
        { status: 500 }
      )
      errorResponse.cookies.delete("access_token")
      errorResponse.cookies.delete("refresh_token")
      return errorResponse
    }

    await supabaseAdmin.from("users").update({ last_activity: new Date().toISOString() }).eq("id", payload.userId)

    const response = NextResponse.json({ success: true }, { status: 200 })

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
      maxAge: REFRESH_TOKEN_EXPIRY, // e.g., 7 days
    })

    console.log("Token refresh successful for user:", payload.email)
    return response
  } catch (error) {
    console.error("Refresh API Error: Unexpected server error", error)
    const errorResponse = NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
    errorResponse.cookies.delete("access_token")
    errorResponse.cookies.delete("refresh_token")
    return errorResponse
  }
}
