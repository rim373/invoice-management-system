import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-server"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    return NextResponse.json({
      success: true,
      user: {
        id: user.userId,
        email: user.email,
        name: user.name,
        role: user.role,
        company: user.company,
      },
    })
  } catch (error) {
    console.log("Me API Error:", error)
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
