import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { requireAuth } from "@/lib/auth-server"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    console.log("Fetching contacts for user:", user.email)

    const { data: contacts, error } = await supabaseAdmin
      .from("contacts")
      .select("*")
      .eq("user_id", user.userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.log("Database Error: Failed to fetch contacts", error)
      return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 })
    }

    const transformedContacts =
      contacts?.map((contact) => ({
        id: contact.id,
        contact_id: contact.contact_id,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        company: contact.company,
        status: contact.status === "active" ? "Active" : contact.status === "inactive" ? "Inactive" : "Pending",
        projects: 0, // Could be calculated from invoices
        lastActivity: contact.updated_at || contact.created_at,
      })) || []

    console.log(`Successfully fetched ${transformedContacts.length} contacts`)
    return NextResponse.json({ success: true, data: transformedContacts })
  } catch (error) {
    console.log("Contacts API Error:", error)
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const contactData = await request.json()

    console.log("Creating contact for user:", user.email)

    if (!contactData.name || !contactData.email || !contactData.company) {
      console.log("Create Contact Error: Missing required fields")
      return NextResponse.json({ error: "Name, email, and company are required" }, { status: 400 })
    }

  
    // Generate next contact ID with CMT format - improved logic
    const { data: existingContacts, error: fetchError } = await supabaseAdmin
      .from("contacts")
      .select("contact_id")
      .like("contact_id", "CMT-%")
      .order("contact_id", { ascending: false })

    if (fetchError) {
      console.log("Error fetching existing contacts:", fetchError)
      return NextResponse.json({ error: "Failed to generate contact ID" }, { status: 500 })
    }

    let nextId = "CMT-001"
    if (existingContacts && existingContacts.length > 0) {
      // Extract numbers from all CMT IDs and find the highest
      const numbers = existingContacts
        .map(contact => {
          const match = contact.contact_id.match(/CMT-(\d+)/)
          return match ? parseInt(match[1]) : 0
        })
        .filter(num => num > 0)
      
      if (numbers.length > 0) {
        const highestNumber = Math.max(...numbers)
        nextId = `CMT-${String(highestNumber + 1).padStart(3, "0")}`
      }
    }

    console.log("Generated contact ID:", nextId)


    const { data: newContact, error } = await supabaseAdmin
      .from("contacts")
      .insert({
        contact_id: nextId,
        user_id: user.userId,
        name: contactData.name,
        email: contactData.email,
        phone: contactData.phone || "",
        company: contactData.company,
        address: contactData.address || "",
        status: "active",
      })
      .select("*")
      .single()

    if (error) {
      console.log("Database Error: Failed to create contact", error)
      return NextResponse.json({ error: "Failed to create contact" }, { status: 500 })
    }

    const transformedContact = {
      id: newContact.id,
      contact_id: newContact.contact_id,
      name: newContact.name,
      email: newContact.email,
      phone: newContact.phone,
      company: newContact.company,
      status: "Active",
      projects: 0,
      lastActivity: newContact.created_at,
    }

    console.log("Contact created successfully:", nextId)
    return NextResponse.json({ success: true, data: transformedContact })
  } catch (error) {
    console.log("Create Contact Error:", error)
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth()
    const contactData = await request.json()

    console.log("Updating contact:", contactData.id)

    if (!contactData.id) {
      console.log("Update Contact Error: Missing contact ID")
      return NextResponse.json({ error: "Contact ID is required" }, { status: 400 })
    }

    const { data: updatedContact, error } = await supabaseAdmin
      .from("contacts")
      .update({
        name: contactData.name,
        email: contactData.email,
        phone: contactData.phone || "",
        company: contactData.company,
        address: contactData.address || "",
        status: contactData.status === "Active" ? "active" : contactData.status === "Inactive" ? "inactive" : "pending",
        updated_at: new Date().toISOString(),
      })
      .eq("id", contactData.id)
      .eq("user_id", user.userId)
      .select("*")
      .single()

    if (error) {
      console.log("Database Error: Failed to update contact", error)
      return NextResponse.json({ error: "Failed to update contact" }, { status: 500 })
    }

    const transformedContact = {
      id: updatedContact.id,
      contact_id: updatedContact.contact_id,
      name: updatedContact.name,
      email: updatedContact.email,
      phone: updatedContact.phone,
      company: updatedContact.company,
      status:
        updatedContact.status === "active" ? "Active" : updatedContact.status === "inactive" ? "Inactive" : "Pending",
      projects: 0,
      lastActivity: updatedContact.updated_at,
    }

    console.log("Contact updated successfully:", updatedContact.contact_id)
    return NextResponse.json({ success: true, data: transformedContact })
  } catch (error) {
    console.log("Update Contact Error:", error)
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const contactId = searchParams.get("contactId")

    console.log("Deleting contact:", contactId)

    if (!contactId) {
      console.log("Delete Contact Error: Missing contact ID")
      return NextResponse.json({ error: "Contact ID is required" }, { status: 400 })
    }

    const { error } = await supabaseAdmin.from("contacts").delete().eq("id", contactId).eq("user_id", user.userId)

    if (error) {
      console.log("Database Error: Failed to delete contact", error)
      return NextResponse.json({ error: "Failed to delete contact" }, { status: 500 })
    }

    console.log("Contact deleted successfully:", contactId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.log("Delete Contact Error:", error)
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
