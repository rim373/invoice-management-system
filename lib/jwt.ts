import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this-in-production"
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "your-super-secret-refresh-key-change-this-in-production"

export interface JWTPayload {
  userId: string
  email: string
  role: "admin" | "user"
  name: string
  company: string
  iat?: number
  exp?: number
  lastActivity?: number
}

// 30 minutes in seconds
const ACCESS_TOKEN_EXPIRY = 30 * 60
// 7 days in seconds
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60

export function generateAccessToken(payload: Omit<JWTPayload, "iat" | "exp" | "lastActivity">): string {
  return jwt.sign(
    {
      ...payload,
      lastActivity: Math.floor(Date.now() / 1000),
    },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY },
  )
}

export function generateRefreshToken(payload: Omit<JWTPayload, "iat" | "exp" | "lastActivity">): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY })
}

export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload

    // Check if token is expired due to inactivity (30 minutes)
    const now = Math.floor(Date.now() / 1000)
    const lastActivity = decoded.lastActivity || decoded.iat || 0
    const inactivityLimit = 30 * 60 // 30 minutes in seconds

    if (now - lastActivity > inactivityLimit) {
      console.log("JWT Error: Token expired due to inactivity")
      return null // Token expired due to inactivity
    }

    return decoded
  } catch (error) {
    console.log("JWT Error: Token verification failed", error)
    return null
  }
}

export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload
  } catch (error) {
    console.log("JWT Error: Refresh token verification failed", error)
    return null
  }
}

export function refreshAccessToken(refreshToken: string): string | null {
  const payload = verifyRefreshToken(refreshToken)
  if (!payload) return null

  return generateAccessToken({
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
    name: payload.name,
    company: payload.company,
  })
}

export function updateTokenActivity(token: string): string | null {
  const payload = verifyAccessToken(token)
  if (!payload) return null

  return generateAccessToken({
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
    name: payload.name,
    company: payload.company,
  })
}
