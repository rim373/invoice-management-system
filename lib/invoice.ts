// Client-side utilities for invoice management
export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface PaymentHistory {
  id: string
  amount: number
  date: string
  method: string
  note?: string
}

export interface Invoice {
  id: string
  user_id: string
  invoice_id: string
  client_id: string
  client_name: string
  client_company: string
  client_email: string
  client_phone: string
  status: "paid" | "partial" | "pending" | "refunded" | "cancelled"
  total_amount: number
  subtotal_amount: number
  tax_amount: number
  tax_rate: number
  discount_amount: number
  paid_amount: number
  currency: string
  created_date: string
  due_date: string
  items: InvoiceItem[]
  payment_history: PaymentHistory[]
  notes?: string
  created_at: string
  updated_at: string
}

export async function fetchInvoices(): Promise<{ success: boolean; invoices?: Invoice[]; error?: string }> {
  try {
    const response = await fetch("/api/invoices", {
      method: "GET",
    })
    const data = await response.json()

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = "/login"
      }
      return { success: false, error: data.error || "Failed to fetch invoices" }
    }

    return { success: true, invoices: data.data }
  } catch (error) {
    return { success: false, error: "Network error" }
  }
}

export async function createInvoice(invoiceData: {
  client_id: string
  client_name: string
  client_company: string
  client_email: string
  client_phone: string
  total_amount: number
  subtotal_amount: number
  tax_amount: number
  tax_rate: number
  discount_amount: number
  currency: string
  created_date: string
  due_date: string
  items: InvoiceItem[]
  notes?: string
}): Promise<{ success: boolean; invoice?: Invoice; error?: string }> {
  try {
    const response = await fetch("/api/invoices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(invoiceData),
    })
    const data = await response.json()

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = "/login"
      }
      return { success: false, error: data.error || "Failed to create invoice" }
    }

    return { success: true, invoice: data.data }
  } catch (error) {
    return { success: false, error: "Network error" }
  }
}

export async function updateInvoice(
  invoiceId: string,
  invoiceData: Partial<Invoice>,
): Promise<{ success: boolean; invoice?: Invoice; error?: string }> {
  try {
    const response = await fetch("/api/invoices", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ invoiceId, ...invoiceData }),
    })
    const data = await response.json()

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = "/login"
      }
      return { success: false, error: data.error || "Failed to update invoice" }
    }

    return { success: true, invoice: data.data }
  } catch (error) {
    return { success: false, error: "Network error" }
  }
}

export async function deleteInvoice(invoiceId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/invoices?invoiceId=${invoiceId}`, {
      method: "DELETE",
    })
    const data = await response.json()

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = "/login"
      }
      return { success: false, error: data.error || "Failed to delete invoice" }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: "Network error" }
  }
}

export async function addPayment(
  invoiceId: string,
  paymentData: {
    amount: number
    method: string
    note?: string
  },
): Promise<{ success: boolean; invoice?: Invoice; error?: string }> {
  try {
    const response = await fetch("/api/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ invoiceId, ...paymentData }),
    })
    const data = await response.json()

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = "/login"
      }
      return { success: false, error: data.error || "Failed to add payment" }
    }

    return { success: true, invoice: data.data }
  } catch (error) {
    return { success: false, error: "Network error" }
  }
}

export function calculateInvoiceTotals(
  items: InvoiceItem[],
  taxRate = 0,
  discountAmount = 0,
  discountType: "percentage" | "fixed" = "percentage",
): {
  subtotal: number
  taxAmount: number
  discountAmount: number
  total: number
} {
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)

  let finalDiscountAmount = 0
  if (discountType === "percentage") {
    finalDiscountAmount = (subtotal * discountAmount) / 100
  } else {
    finalDiscountAmount = discountAmount
  }

  const taxableAmount = subtotal - finalDiscountAmount
  const taxAmount = (taxableAmount * taxRate) / 100
  const total = taxableAmount + taxAmount

  return {
    subtotal,
    taxAmount,
    discountAmount: finalDiscountAmount,
    total,
  }
}
