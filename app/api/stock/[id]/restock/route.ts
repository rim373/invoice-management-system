import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { requireAuth } from "@/lib/auth-server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify authentication
    const authResult = await requireAuth()
    console.log("Auth Result:", authResult)
    if (!authResult.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = authResult.userId
    const stockId = params.id
    const body = await request.json()

    const { quantity } = body

    // Validate quantity
    if (!quantity || Number.parseInt(quantity) <= 0) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 })
    }

    // Get current stock item
    const { data: currentItem, error: fetchError } = await supabaseAdmin
      .from("stock_items")
      .select("quantity")
      .eq("id", stockId)
      .eq("user_id", userId)
      .single()

    if (fetchError || !currentItem) {
      console.error("Database error:", fetchError)
      return NextResponse.json({ error: "Stock item not found" }, { status: 404 })
    }

    // Update stock quantity
    const newQuantity = currentItem.quantity + Number.parseInt(quantity)

    const { data: stockItem, error } = await supabaseAdmin
      .from("stock_items")
      .update({
        quantity: newQuantity,
        updated_at: new Date().toISOString(),
      })
      .eq("id", stockId)
      .eq("user_id", userId)
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to restock item" }, { status: 500 })
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
    console.error("Restock error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
