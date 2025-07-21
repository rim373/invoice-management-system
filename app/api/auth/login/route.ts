import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { generateAccessToken, generateRefreshToken, REFRESH_TOKEN_EXPIRY } from "@/lib/jwt" // Import REFRESH_TOKEN_EXPIRY
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

    // Store refresh token in database
    const { error: insertTokenError } = await supabaseAdmin.from("refresh_tokens").insert({
      user_id: user.id,
      token: refreshToken,
      expires_at: new Date(Date.now() + REFRESH_TOKEN_EXPIRY * 1000).toISOString(),
    })

    if (insertTokenError) {
      console.error("Database Error: Failed to store refresh token", insertTokenError)
      return NextResponse.json({ error: "Internal server error during token storage" }, { status: 500 })
    }

    // --- Device Access Control Logic ---
    const clientIp = request.headers.get("x-forwarded-for") || request.ip || "unknown"
    console.log(`User ${user.email} attempting login from IP: ${clientIp}`)

    // Add console.log for user's access_count
    console.log(`User ${user.email} access_count:`, user.access_count)

    // Block users with access_count: 0
    if (user.access_count === 0) {
      console.log(`Access Denied: User ${user.email} has access_count set to 0. Login blocked.`)
      return NextResponse.json(
        {
          error: "Account access has been disabled. Please contact support.",
        },
        { status: 403 },
      )
    }

    // Check if a session already exists for this user and IP address
    const { data: existingSession, error: fetchSessionError } = await supabaseAdmin
      .from("user_sessions")
      .select("*")
      .eq("user_id", user.id)
      .eq("ip_address", clientIp)
      .single()

    if (fetchSessionError && fetchSessionError.code !== "PGRST116") {
      // PGRST116 means "no rows found"
      console.error("Database Error: Failed to fetch existing session", fetchSessionError)
      return NextResponse.json({ error: "Internal server error during session check" }, { status: 500 })
    }

    if (existingSession) {
      // If session exists for this user and IP, update it
      const { error: updateError } = await supabaseAdmin
        .from("user_sessions")
        .update({ session_token: accessToken, last_active: new Date().toISOString() })
        .eq("id", existingSession.id)

      if (updateError) {
        console.error("Database Error: Failed to update existing session", updateError)
        return NextResponse.json({ error: "Internal server error during session update" }, { status: 500 })
      }
      console.log(`Existing session for user ${user.email} from IP ${clientIp} updated.`)
    } else {
      // If no existing session for this user and IP, check access count before inserting
      const { count: distinctIpCount, error: sessionsError } = await supabaseAdmin
        .from("user_sessions")
        .select("ip_address", { count: "exact" })
        .eq("user_id", user.id)
        .then(({ data, error, count }) => {
          // Manually count distinct IPs if data is returned
          if (data) {
            const uniqueIps = new Set(data.map((s: any) => s.ip_address))
            return { count: uniqueIps.size, error }
          }
          return { count, error }
        })

      if (sessionsError) {
        console.error("Database Error: Failed to count distinct user sessions", sessionsError)
        return NextResponse.json({ error: "Internal server error during session check" }, { status: 500 })
      }

      // Add console.log for distinctIpCount
      console.log(`User ${user.email} distinctIpCount:`, distinctIpCount)
      console.log(`User ${user.email} has ${distinctIpCount} distinct active sessions. Allowed: ${user.access_count}`)

      if (distinctIpCount >= user.access_count) {
        console.log(`Access Denied: User ${user.email} has reached maximum device access (${user.access_count}).`)
        return NextResponse.json(
          {
            error: `Maximum device access reached. You can only log in from ${user.access_count} devices simultaneously.`,
          },
          { status: 403 },
        )
      }

      // Record the new session
      const { error: insertSessionError } = await supabaseAdmin.from("user_sessions").insert({
        user_id: user.id,
        ip_address: clientIp,
        session_token: accessToken, // Using access token as session identifier
        last_active: new Date().toISOString(),
      })

      if (insertSessionError) {
        console.error("Database Error: Failed to record new user session", insertSessionError)
        return NextResponse.json({ error: "Internal server error during session recording" }, { status: 500 })
      }
      console.log(`New session recorded for user ${user.email} from IP ${clientIp}.`)
    }
    // --- End Device Access Control Logic ---

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
        access_count: user.access_count, // Include access_count in user data
        sector: user.sector,
        location: user.location,
        company_size: user.company_size,
        payment_method: user.payment_method,
        join_date: user.join_date,
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
      maxAge: REFRESH_TOKEN_EXPIRY, // 7 days
    })

    console.log("Login successful for:", email)
    return response
  } catch (error) {
    console.log("Login Error: Unexpected server error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
