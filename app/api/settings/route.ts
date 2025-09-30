import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { requireAuth } from "@/lib/auth-server"
import { defaultSettings } from "@/lib/settings" // Import default settings

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    console.log("Fetching settings for user:", user.email)

    const { data: settings, error } = await supabaseAdmin
      .from("user_settings")
      .select("*")
      .eq("user_id", user.userId)
      .single()

    if (error && error.code !== "PGRST116") {
      console.log("Database Error: Failed to fetch settings", error)
      return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
    }

    // If no settings found, return default settings
    if (!settings) {
      console.log("No settings found, returning defaults")
      // Use the imported defaultSettings
      return NextResponse.json({ success: true, settings: defaultSettings })
    }

    console.log("Settings fetched successfully")
    return NextResponse.json({ success: true, settings })
  } catch (error) {
    console.log("Settings API Error:", error)
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const settingsData = await request.json()

    console.log("Saving settings for user:", user.email)

    const { profileSettings, invoiceSettings, generalSettings } = settingsData

    const settingsPayload = {
      user_id: user.userId,
      profile_settings: profileSettings,
      invoice_settings: invoiceSettings,
      general_settings: generalSettings,
    }

    // Try to update existing settings first
    const { data: existingSettings } = await supabaseAdmin
      .from("user_settings")
      .select("id")
      .eq("user_id", user.userId)
      .single()

    let result
    if (existingSettings) {
      // Update existing settings
      result = await supabaseAdmin
        .from("user_settings")
        .update({
          profile_settings: profileSettings,
          invoice_settings: invoiceSettings,
          general_settings: generalSettings,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.userId)
        .select("*")
        .single()
    } else {
      // Create new settings
      result = await supabaseAdmin.from("user_settings").insert(settingsPayload).select("*").single()
    }

    const { data: settings, error } = result

    if (error) {
      console.log("Database Error: Failed to save settings", error)
      return NextResponse.json({ error: "Failed to save settings" }, { status: 500 })
    }

    console.log("Settings saved successfully")
    return NextResponse.json({ success: true, settings })
  } catch (error) {
    console.log("Save Settings Error:", error)
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
