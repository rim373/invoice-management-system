import { cookies } from "next/headers"
import { verifyAccessToken, type JWTPayload } from "./jwt"
import { NextResponse } from "next/server"

export async function getCurrentUser(): Promise<JWTPayload | null> {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("access_token")?.value

    if (!accessToken) {
      console.log("Auth Error: No access token found")
      return null
    }

    const payload = verifyAccessToken(accessToken)
    if (!payload) {
      console.log("Auth Error: Invalid access token")
      return null
    }

    return payload
  } catch (error) {
    console.log("Auth Error: Get current user failed", error)
    return null
  }
}

export async function requireAuth(requiredRole?: "admin" | "user"): Promise<JWTPayload> {
  const user = await getCurrentUser()

  if (!user) {
    console.log("Auth Error: User not authenticated")
    throw new Error("Unauthorized")
  }

  if (requiredRole && user.role !== requiredRole) {
    console.log(`Auth Error: User role ${user.role} does not match required role ${requiredRole}`)
    throw new Error("Forbidden")
  }

  return user
}

export function clearAuthCookiesResponse(message: string = "Cleared"): NextResponse {
  const response = NextResponse.json({ error: message }, { status: 401 })
  response.cookies.delete("access_token")
  response.cookies.delete("refresh_token")
  return response
}
