import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { requireAuth } from "@/lib/auth-server"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify authentication
    const authResult = await requireAuth()
    

    const userId = authResult.userId
    const stockId = params.id
    const body = await request.json()

    const { name, myproduct, quantity, minStock, price, currency, supplier, description } = body

    // Validate required fields
    if (!name || quantity === undefined || price === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Update stock item (only if it belongs to the user)
    const { data: stockItem, error } = await supabaseAdmin
      .from("stock_items")
      .update({
        name,
        my_product: myproduct || true,
        quantity: Number.parseInt(quantity),
        min_stock: Number.parseInt(minStock) || 0,
        price: Number.parseFloat(price),
        currency: currency || "EUR",
        supplier: supplier || null,
        description: description || "",
        updated_at: new Date().toISOString(),
      })
      .eq("id", stockId)
      .eq("user_id", userId)
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to update stock item" }, { status: 500 })
    }

    if (!stockItem) {
      return NextResponse.json({ error: "Stock item not found" }, { status: 404 })
    }

    // Transform database format to frontend format
    const transformedItem = {
      id: stockItem.id,
      name: stockItem.name,
      myproduct: stockItem.my_product,
      quantity: stockItem.quantity,
      minStock: stockItem.min_stock,
      price: Number.parseFloat(stockItem.price),
      currency: stockItem.currency,
      supplier: stockItem.supplier,
      description: stockItem.description,
    }

    return NextResponse.json({ stockItem: transformedItem })
  } catch (error) {
    console.error("Stock update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify authentication
    const authResult = await requireAuth()
    if (!authResult.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = authResult.userId
    const stockId = params.id

    // Delete stock item (only if it belongs to the user)
    const { error } = await supabaseAdmin.from("stock_items").delete().eq("id", stockId).eq("user_id", userId)

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to delete stock item" }, { status: 500 })
    }

    return NextResponse.json({ message: "Stock item deleted successfully" })
  } catch (error) {
    console.error("Stock deletion error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
