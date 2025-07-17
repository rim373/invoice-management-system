// Client-side authentication utilities
const ACTIVITY_CHECK_INTERVAL = 60000 // 1 minute
const INACTIVITY_WARNING_TIME = 25 * 60 * 1000 // 25 minutes
const INACTIVITY_LOGOUT_TIME = 30 * 60 * 1000 // 30 minutes

let activityTimer: NodeJS.Timeout | null = null
let warningTimer: NodeJS.Timeout | null = null
let lastActivity = Date.now()

// Track user activity
function updateActivity() {
  lastActivity = Date.now()
}

// Check for inactivity
function checkInactivity() {
  const now = Date.now()
  const timeSinceActivity = now - lastActivity

  if (timeSinceActivity >= INACTIVITY_LOGOUT_TIME) {
    // Auto logout after 30 minutes
    logoutUser()
    return
  }

  if (timeSinceActivity >= INACTIVITY_WARNING_TIME) {
    // Show warning at 25 minutes
    const remainingTime = Math.ceil((INACTIVITY_LOGOUT_TIME - timeSinceActivity) / 1000 / 60)
    console.warn(`Session will expire in ${remainingTime} minutes due to inactivity`)
  }
}

// Start activity tracking
export function startActivityTracking() {
  // Track mouse, keyboard, and touch events
  const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"]

  events.forEach((event) => {
    document.addEventListener(event, updateActivity, true)
  })

  // Start periodic inactivity checks
  if (activityTimer) clearInterval(activityTimer)
  activityTimer = setInterval(checkInactivity, ACTIVITY_CHECK_INTERVAL)
}

// Stop activity tracking
export function stopActivityTracking() {
  const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"]

  events.forEach((event) => {
    document.removeEventListener(event, updateActivity, true)
  })

  if (activityTimer) {
    clearInterval(activityTimer)
    activityTimer = null
  }

  if (warningTimer) {
    clearTimeout(warningTimer)
    warningTimer = null
  }
}

// Login user
export async function loginUser(email: string, password: string) {
  try {
    console.log("Attempting login for:", email)

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.log("Login Error: HTTP", response.status, data.error)
      return { success: false, error: data.error || "Login failed" }
    }

    if (data.success) {
      console.log("Login successful for:", email)
      startActivityTracking()
      return { success: true, user: data.user }
    }

    console.log("Login Error: Unexpected response", data)
    return { success: false, error: "Login failed" }
  } catch (error) {
    console.log("Login Error: Network/Client error", error)
    return { success: false, error: "Network error. Please try again." }
  }
}

// Logout user
export async function logoutUser() {
  try {
    stopActivityTracking()

    await fetch("/api/auth/logout", {
      method: "POST",
    })

    console.log("Logout successful")
    // Redirect to login page
    window.location.href = "/"
  } catch (error) {
    console.log("Logout Error:", error)
    // Force redirect even if logout request fails
    window.location.href = "/"
  }
}

// Get current user
export async function getCurrentUser() {
  try {
    const response = await fetch("/api/auth/me")

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.user || null
  } catch (error) {
    console.log("Get current user error:", error)
    return null
  }
}

// Refresh token
export async function refreshToken() {
  try {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
    })

    if (!response.ok) {
      throw new Error("Token refresh failed")
    }

    const data = await response.json()
    return data.success
  } catch (error) {
    console.log("Token refresh error:", error)
    return false
  }
}
