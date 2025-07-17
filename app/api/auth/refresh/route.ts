import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { verifyRefreshToken, generateAccessToken } from "@/lib/jwt"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get("refresh_token")?.value

    if (!refreshToken) {
      console.log("Refresh Error: No refresh token provided")
      return NextResponse.json({ error: "No refresh token" }, { status: 401 })
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken)

    // Check if refresh token exists in database
    const { data: tokenRecord, error: tokenError } = await supabaseAdmin
      .from("refresh_tokens")
      .select("*")
      .eq("token", refreshToken)
      .eq("user_id", payload.userId)
      .single()

    if (tokenError || !tokenRecord) {
      console.log("Database Error: Invalid refresh token", tokenError)
      return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 })
    }

    // Check if token is expired
    if (new Date(tokenRecord.expires_at) < new Date()) {
      console.log("Token Error: Refresh token expired")
      await supabaseAdmin.from("refresh_tokens").delete().eq("token", refreshToken)

      return NextResponse.json({ error: "Refresh token expired" }, { status: 401 })
    }

    // Generate new access token
    const newAccessToken = generateAccessToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      name: payload.name,
      company: payload.company,
    })

    // Update last activity
    await supabaseAdmin.from("users").update({ last_activity: new Date().toISOString() }).eq("id", payload.userId)

    // Set new access token cookie
    const response = NextResponse.json({ success: true })

    response.cookies.set("access_token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 60, // 30 minutes
    })

    console.log("Token refresh successful for user:", payload.email)
    return response
  } catch (error) {
    console.log("Refresh API Error:", error)
    return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 })
  }
}
