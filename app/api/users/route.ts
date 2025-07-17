import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin, type User } from "@/lib/supabase"
import bcrypt from "bcryptjs"
import { verifyAccessToken } from "@/lib/jwt"

// Helper to check if the user is an admin
async function isAdmin(request: NextRequest): Promise<boolean> {
  const accessToken = request.cookies.get("access_token")?.value
  if (!accessToken) return false

  const decoded = verifyAccessToken(accessToken)
  return decoded?.role === "admin"
}

// Helper function to transform user data for frontend
const transformUserForFrontend = (user: any) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone || "",
  company: user.company || "",
  role: user.role,
  status: user.status === "active" ? "Active" : user.status === "inactive" ? "Inactive" : "Pending",
  projects: 0, // Could be calculated from invoices
  lastActivity: user.updated_at || user.created_at,
  access: user.access_count || 1,
  secteur: user.sector || "Technology",
  location: user.location || "Europe",
  company_size: user.company_size || "1-10 employees",
  paiement_method: user.payment_method || "Per Month",
  date: user.join_date || new Date().toISOString().split("T")[0],
  image: user.image
})

export async function GET(request: NextRequest) {
  if (!(await isAdmin(request))) {
    console.log("Access denied: User is not admin")
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
  }

  try {
    console.log("Fetching users...")
    
    const { data: users, error } = await supabaseAdmin
      .from("users")
      .select(
        "id, email, name, company, phone, role, access_count, sector, location, company_size, payment_method, join_date, status, created_at, updated_at, image",
      )
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Database Error: Failed to fetch users", error)
      return NextResponse.json({ success: false, error: "Failed to fetch users" }, { status: 500 })
    }

    const transformedUsers = users?.map(transformUserForFrontend) || []

    console.log(`Successfully fetched ${transformedUsers.length} users`)
    return NextResponse.json({ success: true, data: transformedUsers })
  } catch (error) {
    console.error("API Error: Unexpected error fetching users", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin(request))) {
    console.log("Access denied: User is not admin")
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
  }

  try {
    const userData = await request.json()
    console.log("Creating user:", userData.email)
    console.log("Create user data received:", userData)

    if (!userData.email || !userData.password || !userData.name || !userData.company) {
      console.log("Create User Error: Missing required fields")
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", userData.email.toLowerCase())
      .single()

    if (existingUser) {
      console.log("Create User Error: User already exists")
      return NextResponse.json({ success: false, error: "User with this email already exists" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10)

    const newUser: Partial<User> = {
      email: userData.email.toLowerCase(),
      password_hash: hashedPassword,
      name: userData.name,
      company: userData.company,
      phone: userData.phone || "",
      role: userData.role || "user",
      access_count: userData.access_count || userData.access || 1,
      sector: userData.secteur || userData.sector || "Technology",
      location: userData.location || "Europe",
      company_size: userData.company_size || "1-10 employees",
      payment_method: userData.paiement_method || userData.payment_method || "Per Month",
      join_date: userData.date || userData.join_date || new Date().toISOString().split("T")[0],
      status: userData.status === "Active" ? "active" : userData.status === "Inactive" ? "inactive" : "pending",
      image: userData.image,
    }

    const { data, error } = await supabaseAdmin
      .from("users")
      .insert([newUser])
      .select("id, email, name, company, phone, role, access_count, sector, location, company_size, payment_method, join_date, status, created_at, updated_at, image")
      .single()

    if (error) {
      console.error("Database Error: Failed to create user", error)
      return NextResponse.json({ success: false, error: "Failed to create user" }, { status: 500 })
    }

    const transformedUser = transformUserForFrontend(data)
    console.log("User created successfully:", data.email)
    return NextResponse.json({ success: true, data: transformedUser }, { status: 201 })
  } catch (error) {
    console.error("API Error: Unexpected error creating user", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  if (!(await isAdmin(request))) {
    console.log("Access denied: User is not admin")
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
  }

  try {
    const userData = await request.json()
    console.log("Updating user:", userData.id)
    console.log("Update user data received:", userData)

    if (!userData.id) {
      console.log("Update User Error: Missing user ID")
      return NextResponse.json({ success: false, error: "User ID is required for update" }, { status: 400 })
    }

    const updatedUser: Partial<User> = {
      email: userData.email?.toLowerCase(),
      name: userData.name,
      company: userData.company,
      phone: userData.phone || "",
      role: userData.role,
      access_count: userData.access_count || userData.access || 1,
      sector: userData.secteur || userData.sector || "Technology",
      location: userData.location || "Europe",
      company_size: userData.company_size || "1-10 employees",
      payment_method: userData.paiement_method || userData.payment_method || "Per Month",
      join_date: userData.date || userData.join_date || new Date().toISOString().split("T")[0],
      status: userData.status === "Active" ? "active" : userData.status === "Inactive" ? "inactive" : "pending",
      image: userData.image,
      updated_at: new Date().toISOString(),
    }

    // Handle password update if provided
    if (userData.password && userData.password !== "") {
      updatedUser.password_hash = await bcrypt.hash(userData.password, 10)
    }

    // Remove undefined values to prevent overwriting with null
    Object.keys(updatedUser).forEach(
      (key) => updatedUser[key as keyof Partial<User>] === undefined && delete updatedUser[key as keyof Partial<User>],
    )

    const { data, error } = await supabaseAdmin
      .from("users")
      .update(updatedUser)
      .eq("id", userData.id)
      .select("id, email, name, company, phone, role, access_count, sector, location, company_size, payment_method, join_date, status, created_at, updated_at, image")
      .single()

    if (error) {
      console.error("Database Error: Failed to update user", error)
      return NextResponse.json({ success: false, error: "Failed to update user" }, { status: 500 })
    }

    const transformedUser = transformUserForFrontend(data)
    console.log("User updated successfully:", data.email)
    return NextResponse.json({ success: true, data: transformedUser })
  } catch (error) {
    console.error("API Error: Unexpected error updating user", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdmin(request))) {
    console.log("Access denied: User is not admin")
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
  }

  try {
    const { id } = await request.json()
    console.log("Deleting user:", id)

    if (!id) {
      console.log("Delete User Error: Missing user ID")
      return NextResponse.json({ success: false, error: "User ID is required for deletion" }, { status: 400 })
    }

    const { error } = await supabaseAdmin.from("users").delete().eq("id", id)

    if (error) {
      console.error("Database Error: Failed to delete user", error)
      return NextResponse.json({ success: false, error: "Failed to delete user" }, { status: 500 })
    }

    console.log("User deleted successfully:", id)
    return NextResponse.json({ success: true, message: "User deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("API Error: Unexpected error deleting user", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}