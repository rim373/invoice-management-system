import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { requireAuth } from "@/lib/auth-server"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { invoiceId, paymentData } = await request.json()

    console.log("Adding payment to invoice:", invoiceId)

    if (!invoiceId || !paymentData.amount || !paymentData.method) {
      console.log("Payment Error: Missing required fields")
      return NextResponse.json({ error: "Invoice ID, amount, and payment method are required" }, { status: 400 })
    }

    // Get invoice
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from("invoices")
      .select("*")
      .eq("id", invoiceId)
      .eq("user_id", user.userId)
      .single()

    if (invoiceError || !invoice) {
      console.log("Database Error: Invoice not found", invoiceError)
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    const remainingAmount = Number.parseFloat(invoice.total_amount) - Number.parseFloat(invoice.paid_amount)

    if (paymentData.amount > remainingAmount) {
      console.log("Payment Error: Amount exceeds remaining balance")
      return NextResponse.json(
        {
          error: "Payment amount cannot exceed remaining balance",
        },
        { status: 400 },
      )
    }

    // Create payment record
    const paymentRecord = {
      id: `PAY-${Date.now()}`,
      amount: Number.parseFloat(paymentData.amount),
      date: new Date().toISOString().split("T")[0],
      method: paymentData.method,
      note: paymentData.note || "",
    }

    // Update invoice payment history and paid amount
    const currentPaymentHistory = invoice.payment_history || []
    const newPaymentHistory = [...currentPaymentHistory, paymentRecord]
    const newPaidAmount = Number.parseFloat(invoice.paid_amount) + paymentData.amount

    // Determine new status
    let newStatus = invoice.status
    if (invoice.status === "pending" || invoice.status === "partial") {
      newStatus =
        newPaidAmount >= Number.parseFloat(invoice.total_amount) ? "paid" : newPaidAmount > 0 ? "partial" : "pending"
    }

    const { data: updatedInvoice, error: updateError } = await supabaseAdmin
      .from("invoices")
      .update({
        paid_amount: newPaidAmount,
        status: newStatus,
        payment_history: newPaymentHistory,
        updated_at: new Date().toISOString(),
      })
      .eq("id", invoiceId)
      .eq("user_id", user.userId)
      .select("*")
      .single()

    if (updateError) {
      console.log("Database Error: Failed to update invoice", updateError)
      return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 })
    }

    console.log("Payment added successfully to invoice:", invoiceId)
    return NextResponse.json({
      success: true,
      message: "Payment added successfully",
      data: {
        payment: paymentRecord,
        invoice: updatedInvoice,
        paidUntilNow: newPaidAmount,
        remaining: Number.parseFloat(invoice.total_amount) - newPaidAmount,
      },
    })
  } catch (error) {
    console.log("Add Payment Error:", error)
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { invoiceId, status } = await request.json()

    console.log("Updating invoice status:", invoiceId, status)

    if (!invoiceId || !status) {
      console.log("Status Update Error: Missing required fields")
      return NextResponse.json({ error: "Invoice ID and status are required" }, { status: 400 })
    }

    const { data: invoice, error } = await supabaseAdmin
      .from("invoices")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", invoiceId)
      .eq("user_id", user.userId)
      .select("*")
      .single()

    if (error) {
      console.log("Database Error: Failed to update invoice status", error)
      return NextResponse.json({ error: "Failed to update invoice status" }, { status: 500 })
    }

    console.log("Invoice status updated successfully:", invoiceId)
    return NextResponse.json({
      success: true,
      message: "Invoice status updated successfully",
      data: invoice,
    })
  } catch (error) {
    console.log("Update Status Error:", error)
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
