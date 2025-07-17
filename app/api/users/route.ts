import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { requireAuth } from "@/lib/auth-server"
import bcrypt from "bcryptjs"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    // Only admins can view users
    if (user.role !== "admin") {
      console.log("Access denied: User is not admin")
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    console.log("Fetching users for admin:", user.email)

    const { data: users, error } = await supabaseAdmin
      .from("users")
      .select("id, email, name, company, role, status, created_at, last_activity")
      .order("created_at", { ascending: false })

    if (error) {
      console.log("Database Error: Failed to fetch users", error)
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }

    const transformedUsers =
      users?.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: "", // Not stored in users table
        company: user.company || "",
        status: user.status === "active" ? "Active" : user.status === "inactive" ? "Inactive" : "Pending",
        projects: 0, // Could be calculated from invoices
        lastActivity: user.last_activity || user.created_at,
      })) || []

    console.log(`Successfully fetched ${transformedUsers.length} users`)
    return NextResponse.json({ success: true, data: transformedUsers })
  } catch (error) {
    console.log("Users API Error:", error)
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

    // Only admins can create users
    if (user.role !== "admin") {
      console.log("Access denied: User is not admin")
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const userData = await request.json()
    console.log("Creating user:", userData.email)

    if (!userData.name || !userData.email || !userData.password) {
      console.log("Create User Error: Missing required fields")
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin.from("users").select("id").eq("email", userData.email).single()

    if (existingUser) {
      console.log("Create User Error: User already exists")
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(userData.password, 12)

    const { data: newUser, error } = await supabaseAdmin
      .from("users")
      .insert({
        name: userData.name,
        email: userData.email,
        password_hash: passwordHash,
        company: userData.company || "",
        role: "user", // New users are always regular users
        status: "active",
      })
      .select("id, email, name, company, role, status, created_at")
      .single()

    if (error) {
      console.log("Database Error: Failed to create user", error)
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    const transformedUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: "",
      company: newUser.company || "",
      status: "Active",
      projects: 0,
      lastActivity: newUser.created_at,
    }

    console.log("User created successfully:", newUser.email)
    return NextResponse.json({ success: true, data: transformedUser })
  } catch (error) {
    console.log("Create User Error:", error)
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth()

    // Only admins can update users
    if (user.role !== "admin") {
      console.log("Access denied: User is not admin")
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const userData = await request.json()
    console.log("Updating user:", userData.id)

    if (!userData.id) {
      console.log("Update User Error: Missing user ID")
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const updateData: any = {
      name: userData.name,
      company: userData.company || "",
      status: userData.status === "Active" ? "active" : userData.status === "Inactive" ? "inactive" : "pending",
      updated_at: new Date().toISOString(),
    }

    // Only update password if provided
    if (userData.password) {
      updateData.password_hash = await bcrypt.hash(userData.password, 12)
    }

    const { data: updatedUser, error } = await supabaseAdmin
      .from("users")
      .update(updateData)
      .eq("id", userData.id)
      .select("id, email, name, company, role, status, created_at, last_activity")
      .single()

    if (error) {
      console.log("Database Error: Failed to update user", error)
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
    }

    const transformedUser = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: "",
      company: updatedUser.company || "",
      status: updatedUser.status === "active" ? "Active" : updatedUser.status === "inactive" ? "Inactive" : "Pending",
      projects: 0,
      lastActivity: updatedUser.last_activity || updatedUser.created_at,
    }

    console.log("User updated successfully:", updatedUser.email)
    return NextResponse.json({ success: true, data: transformedUser })
  } catch (error) {
    console.log("Update User Error:", error)
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth()

    // Only admins can delete users
    if (user.role !== "admin") {
      console.log("Access denied: User is not admin")
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    console.log("Deleting user:", userId)

    if (!userId) {
      console.log("Delete User Error: Missing user ID")
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Don't allow deleting self
    if (userId === user.userId) {
      console.log("Delete User Error: Cannot delete self")
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    const { error } = await supabaseAdmin.from("users").delete().eq("id", userId)

    if (error) {
      console.log("Database Error: Failed to delete user", error)
      return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
    }

    console.log("User deleted successfully:", userId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.log("Delete User Error:", error)
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
