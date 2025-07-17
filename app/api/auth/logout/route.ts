import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get("refresh_token")?.value

    if (refreshToken) {
      // Remove refresh token from database
      await supabaseAdmin.from("refresh_tokens").delete().eq("token", refreshToken)
    }

    // Clear cookies
    const response = NextResponse.json({ success: true })

    response.cookies.set("access_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
    })

    response.cookies.set("refresh_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
    })

    console.log("Logout successful")
    return response
  } catch (error) {
    console.log("Logout API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
