// Client-side authentication utilities
const ACTIVITY_CHECK_INTERVAL = 60000 // 1 minute
const INACTIVITY_WARNING_TIME = 50 * 60 * 1000 // 50 minutes
const INACTIVITY_LOGOUT_TIME = 1 * 60 * 60 * 1000 // 1 hour in milliseconds (changed from 2 hours)
const SESSION_CHECK_INTERVAL = 10 * 1000 // 10 seconds

let activityTimer: NodeJS.Timeout | null = null
let warningTimer: NodeJS.Timeout | null = null
let sessionCheckTimer: NodeJS.Timeout | null = null
let lastActivity = Date.now()
let isTrackingActive = false

// Track user activity
function updateActivity() {
  lastActivity = Date.now()
}

// Check for inactivity
function checkInactivity(onWarning: () => void, onLogout: () => void) {
  const now = Date.now()
  const timeSinceActivity = now - lastActivity

  if (timeSinceActivity >= INACTIVITY_LOGOUT_TIME) {
    // Auto logout after 1 hour
    onLogout()
    return
  }

  if (timeSinceActivity >= INACTIVITY_WARNING_TIME && !warningTimer) {
    // Show warning at 50 minutes
    onWarning()
    warningTimer = setTimeout(() => {
      warningTimer = null
    }, INACTIVITY_LOGOUT_TIME - INACTIVITY_WARNING_TIME)
  }
}

// Handle window/tab close
function handleWindowClose() {
  if (isTrackingActive) {
    // Send logout request synchronously before page unloads
    navigator.sendBeacon("/api/auth/logout", JSON.stringify({}))
  }
}

// Start activity tracking
export function startActivityTracking(onWarning: () => void, onLogout: () => void, onPeriodicCheck: () => void) {
  isTrackingActive = true

  // Track mouse, keyboard, and touch events
  const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"]

  events.forEach((event) => {
    document.addEventListener(event, updateActivity, true)
  })

  // Add window close detection
  window.addEventListener("beforeunload", handleWindowClose)
  window.addEventListener("unload", handleWindowClose)

  // Start periodic inactivity checks
  if (activityTimer) clearInterval(activityTimer)
  activityTimer = setInterval(() => checkInactivity(onWarning, onLogout), ACTIVITY_CHECK_INTERVAL)

  // Start periodic session validity checks (every 10 seconds)
  if (sessionCheckTimer) clearInterval(sessionCheckTimer)
  sessionCheckTimer = setInterval(onPeriodicCheck, SESSION_CHECK_INTERVAL)
}

// Stop activity tracking
export function stopActivityTracking() {
  isTrackingActive = false

  const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"]

  events.forEach((event) => {
    document.removeEventListener(event, updateActivity, true)
  })

  // Remove window close detection
  window.removeEventListener("beforeunload", handleWindowClose)
  window.removeEventListener("unload", handleWindowClose)

  if (activityTimer) {
    clearInterval(activityTimer)
    activityTimer = null
  }

  if (warningTimer) {
    clearTimeout(warningTimer)
    warningTimer = null
  }

  if (sessionCheckTimer) {
    clearInterval(sessionCheckTimer)
    sessionCheckTimer = null
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
      console.log("getCurrentUser: API returned not ok", response.status)
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
      console.log("refreshToken: API returned not ok", response.status)
      return false
    }

    const data = await response.json()
    return data.success
  } catch (error) {
    console.log("Token refresh error:", error)
    return false
  }
}

// Enhanced function to check authentication status with better refresh handling
export async function checkAuthStatus(
  onAuthenticated: (user: any) => void,
  onUnauthenticated: () => void,
): Promise<any | null> {
  try {
    // First, try to get current user
    let user = await getCurrentUser()

    if (user) {
      console.log("User authenticated with valid access token")
      onAuthenticated(user)
      return user
    }

    // If access token is invalid, try to refresh
    console.log("Access token invalid, attempting to refresh...")
    const refreshSuccess = await refreshToken()

    if (refreshSuccess) {
      console.log("Token refreshed successfully, re-fetching user...")
      user = await getCurrentUser()

      if (user) {
        console.log("User re-authenticated after token refresh")
        onAuthenticated(user)
        return user
      } else {
        console.log("Failed to get user after successful token refresh")
      }
    } else {
      console.log("Token refresh failed")
    }

    // If we reach here, authentication failed
    console.log("Authentication failed, redirecting to login")
    onUnauthenticated()
    return null
  } catch (error) {
    console.error("Error during authentication status check:", error)
    onUnauthenticated()
    return null
  }
}
