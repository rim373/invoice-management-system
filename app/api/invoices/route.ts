import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { requireAuth } from "@/lib/auth-server"

// Helper function to format dates for database insertion
function formatDateForDb(dateValue: string | null | undefined, isRequired: boolean = false): string | null {
  if (!dateValue || dateValue.trim() === "") {
    if (isRequired) {
      // Return today's date as default for required date fields
      return new Date().toISOString().split('T')[0]
    }
    return null
  }
  return dateValue
}

// Add this function to generate invoice numbers
async function generateInvoiceNumber(userId: string): Promise<string> {
  try {
    // Get the latest invoice number for this user
    const { data: latestInvoice, error } = await supabaseAdmin
      .from("invoices")
      .select("invoice_number")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw error
    }

    // Extract number from latest invoice or start from 1
    let nextNumber = 1
    if (latestInvoice?.invoice_number) {
      // Extract number from format like "INV-2025-001"
      const match = latestInvoice.invoice_number.match(/INV-\d{4}-(\d+)/)
      if (match) {
        nextNumber = parseInt(match[1]) + 1
      }
    }

    // Generate new invoice number
    const year = new Date().getFullYear()
    const paddedNumber = nextNumber.toString().padStart(3, '0')
    return `INV-${year}-${paddedNumber}`
  } catch (error) {
    console.error("Error generating invoice number:", error)
    // Fallback to timestamp-based number
    const timestamp = Date.now().toString().slice(-6)
    return `INV-${new Date().getFullYear()}-${timestamp}`
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    console.log("Fetching invoices for user:", user.email)

    const { data: invoices, error } = await supabaseAdmin
      .from("invoices")
      .select("*")
      .eq("user_id", user.userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.log("Database Error: Failed to fetch invoices", error)
      return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 })
    }

    const transformedInvoices =
      invoices?.map((invoice) => ({
        id: invoice.id,
        number: invoice.invoice_number,
        clientName: invoice.client_name,
        clientId: invoice.contact_id,
        clientCompany: invoice.client_company,
        clientEmail: invoice.client_email,
        clientPhone: invoice.client_phone,
        status: invoice.status,
        totalAmount: invoice.total_amount,
        subtotalAmount: invoice.subtotal_amount,
        taxAmount: invoice.tax_amount,
        taxRate: invoice.tax_rate,
        paidAmount: invoice.paid_amount,
        currency: invoice.currency,
        createdDate: invoice.created_date,
        dueDate: invoice.due_date || "", 
        items: invoice.items,
        paymentHistory: invoice.payment_history || [],
        createdBy: user.email,
        userRole: user.role,
        discountAmount: invoice.discount_amount,
        discountType: invoice.discount_type,
        vatNumber: invoice.vat_number,
        notes: invoice.notes,
      })) || []

    console.log(`Successfully fetched ${transformedInvoices.length} invoices`)
    return NextResponse.json({ success: true, data: transformedInvoices })
  } catch (error) {
    console.log("Invoices API Error:", error)
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const invoiceData = await request.json()

    console.log("Creating invoice for user:", user.email)
    console.log("Invoice data dates:", {
      createdDate: invoiceData.invoiceData.createdDate,
      dueDate: invoiceData.invoiceData.dueDate
    })

    if (
      !invoiceData.invoiceData.clientName ||
      !invoiceData.invoiceData.items ||
      invoiceData.invoiceData.items.length === 0
    ) {
      console.log("Create Invoice Error: Missing required fields")
      return NextResponse.json({ error: "Client name and items are required" }, { status: 400 })
    }

    const invoice = invoiceData.invoiceData

    // Generate invoice number if not provided
    const invoiceNumber = invoice.number || await generateInvoiceNumber(user.userId)
    console.log("Generated invoice number:", invoiceNumber)

    const { data: newInvoice, error } = await supabaseAdmin
      .from("invoices")
      .insert({
        invoice_number: invoiceNumber,
        user_id: user.userId,
        contact_id: invoice.clientId,
        client_name: invoice.clientName,
        client_company: invoice.clientCompany,
        client_email: invoice.clientEmail,
        client_phone: invoice.clientPhone,
        status: invoice.status || "pending",
        total_amount: invoice.totalAmount,
        subtotal_amount: invoice.subtotalAmount,
        tax_amount: invoice.taxAmount || 0,
        tax_rate: invoice.taxRate || 0,
        paid_amount: invoice.paidAmount || 0,
        currency: invoice.currency || "EUR",
        created_date: formatDateForDb(invoice.createdDate, true),
        due_date: formatDateForDb(invoice.dueDate, true),
        items: invoice.items,
        payment_history: invoice.paymentHistory || [],
        discount_amount: invoice.discountAmount || 0,
        discount_type: invoice.discountType || "percentage",
        vat_number: invoice.vatNumber,
        notes: invoice.notes,
      })
      .select("*")
      .single()

    if (error) {
      console.log("Database Error: Failed to create invoice", error)
      return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 })
    }

    const transformedInvoice = {
      id: newInvoice.id,
      number: newInvoice.invoice_number,
      clientName: newInvoice.client_name,
      clientId: newInvoice.contact_id,
      clientCompany: newInvoice.client_company,
      clientEmail: newInvoice.client_email,
      clientPhone: newInvoice.client_phone,
      status: newInvoice.status,
      totalAmount: newInvoice.total_amount,
      subtotalAmount: newInvoice.subtotal_amount,
      taxAmount: newInvoice.tax_amount,
      taxRate: newInvoice.tax_rate,
      paidAmount: newInvoice.paid_amount,
      currency: newInvoice.currency,
      createdDate: newInvoice.created_date,
      dueDate: newInvoice.due_date || "",
      items: newInvoice.items,
      paymentHistory: newInvoice.payment_history,
      createdBy: user.email,
      userRole: user.role,
      discountAmount: newInvoice.discount_amount,
      discountType: newInvoice.discount_type,
      vatNumber: newInvoice.vat_number,
      notes: newInvoice.notes,
    }

    console.log("Invoice created successfully:", newInvoice.invoice_number)
    return NextResponse.json({ success: true, data: transformedInvoice })
  } catch (error) {
    console.log("Create Invoice Error:", error)
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth()
    const invoiceData = await request.json()

    console.log("Updating invoice:", invoiceData.invoiceData.id)

    if (!invoiceData.invoiceData.id) {
      console.log("Update Invoice Error: Missing invoice ID")
      return NextResponse.json({ error: "Invoice ID is required" }, { status: 400 })
    }

    const invoice = invoiceData.invoiceData

    const { data: updatedInvoice, error } = await supabaseAdmin
      .from("invoices")
      .update({
        client_name: invoice.clientName,
        contact_id: invoice.clientId,
        client_company: invoice.clientCompany,
        client_email: invoice.clientEmail,
        client_phone: invoice.clientPhone,
        status: invoice.status,
        total_amount: invoice.totalAmount,
        subtotal_amount: invoice.subtotalAmount,
        tax_amount: invoice.taxAmount,
        tax_rate: invoice.taxRate,
        paid_amount: invoice.paidAmount,
        currency: invoice.currency,
        due_date: formatDateForDb(invoice.dueDate, true),
        items: invoice.items,
        payment_history: invoice.paymentHistory,
        discount_amount: invoice.discountAmount,
        discount_type: invoice.discountType,
        vat_number: invoice.vatNumber,
        notes: invoice.notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", invoice.id)
      .eq("user_id", user.userId)
      .select("*")
      .single()

    if (error) {
      console.log("Database Error: Failed to update invoice", error)
      return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 })
    }

    const transformedInvoice = {
      id: updatedInvoice.id,
      number: updatedInvoice.invoice_number,
      clientName: updatedInvoice.client_name,
      clientId: updatedInvoice.contact_id,
      clientCompany: updatedInvoice.client_company,
      clientEmail: updatedInvoice.client_email,
      clientPhone: updatedInvoice.client_phone,
      status: updatedInvoice.status,
      totalAmount: updatedInvoice.total_amount,
      subtotalAmount: updatedInvoice.subtotal_amount,
      taxAmount: updatedInvoice.tax_amount,
      taxRate: updatedInvoice.tax_rate,
      paidAmount: updatedInvoice.paid_amount,
      currency: updatedInvoice.currency,
      createdDate: updatedInvoice.created_date,
      dueDate: updatedInvoice.due_date || "",
      items: updatedInvoice.items,
      paymentHistory: updatedInvoice.payment_history,
      createdBy: user.email,
      userRole: user.role,
      discountAmount: updatedInvoice.discount_amount,
      discountType: updatedInvoice.discount_type,
      vatNumber: updatedInvoice.vat_number,
      notes: updatedInvoice.notes,
    }

    console.log("Invoice updated successfully:", updatedInvoice.invoice_number)
    return NextResponse.json({ success: true, data: transformedInvoice })
  } catch (error) {
    console.log("Update Invoice Error:", error)
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
    const invoiceId = searchParams.get("invoiceId")

    console.log("Deleting invoice:", invoiceId)

    if (!invoiceId) {
      console.log("Delete Invoice Error: Missing invoice ID")
      return NextResponse.json({ error: "Invoice ID is required" }, { status: 400 })
    }

    const { error } = await supabaseAdmin.from("invoices").delete().eq("id", invoiceId).eq("user_id", user.userId)

    if (error) {
      console.log("Database Error: Failed to delete invoice", error)
      return NextResponse.json({ error: "Failed to delete invoice" }, { status: 500 })
    }

    console.log("Invoice deleted successfully:", invoiceId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.log("Delete Invoice Error:", error)
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}