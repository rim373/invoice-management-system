import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    console.log("Login attempt for email:", email)

    if (!email || !password) {
      console.log("Login Error: Missing email or password")
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const supabase = supabaseAdmin

    // Get user from database
    console.log("Querying database for user:", email)
    const { data: user, error } = await supabase.from("users").select("*").eq("email", email.toLowerCase()).single()

    if (error) {
      console.log("Database Error: Failed to find user", error)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    if (!user) {
      console.log("Database Error: User not found for email:", email)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    console.log("User found, verifying password...")

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      console.log("Password Error: Invalid password for user:", email)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    console.log("Password verified, generating tokens...")

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      company: user.company,
    })

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      company: user.company,
    })

    console.log("Tokens generated, setting cookies...")

    // Set cookies
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        company: user.company,
        role: user.role,
      },
    })

    response.cookies.set("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 60, // 30 minutes
    })

    response.cookies.set("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    console.log("Login successful for:", email)
    return response
  } catch (error) {
    console.log("Login Error: Unexpected server error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}