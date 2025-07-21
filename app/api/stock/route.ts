import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth-server"

export async function GET(request: NextRequest) {
  try {
    // Verify authentication using your existing auth system
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = user.userId

    // Get stock items for the user
    const { data: stockItems, error } = await supabaseAdmin
      .from("stock_items")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch stock items" }, { status: 500 })
    }

    // Transform database format to frontend format
    const transformedItems = stockItems.map((item) => ({
      id: item.id,
      name: item.name,
      myproduct: item.my_product,
      quantity: item.quantity,
      minStock: item.min_stock,
      price: Number.parseFloat(item.price),
      currency: item.currency,
      supplier: item.supplier,
      description: item.description,
    }))

    return NextResponse.json({ stockItems: transformedItems })
  } catch (error) {
    console.error("Stock fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication using your existing auth system
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = user.userId
    const body = await request.json()
    const { name, myproduct, quantity, minStock, price, currency, supplier, description } = body

    // Validate required fields
    if (!name || quantity === undefined || price === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Insert new stock item
    const { data: stockItem, error } = await supabaseAdmin
      .from("stock_items")
      .insert({
        user_id: userId,
        name,
        my_product: myproduct || true,
        quantity: Number.parseInt(quantity),
        min_stock: Number.parseInt(minStock) || 0,
        price: Number.parseFloat(price),
        currency: currency || "EUR",
        supplier: supplier || null,
        description: description || "",
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to create stock item" }, { status: 500 })
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

    return NextResponse.json({ stockItem: transformedItem }, { status: 201 })
  } catch (error) {
    console.error("Stock creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify authentication using your existing auth system
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = user.userId
    const body = await request.json()
    const { id, name, myproduct, quantity, minStock, price, currency, supplier, description } = body

    // Validate required fields
    if (!id || !name || quantity === undefined || price === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Update stock item
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
      .eq("id", id)
      .eq("user_id", userId) // Ensure user can only update their own items
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to update stock item" }, { status: 500 })
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

export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication using your existing auth system
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = user.userId
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Missing stock item ID" }, { status: 400 })
    }

    // Delete stock item
    const { error } = await supabaseAdmin
      .from("stock_items")
      .delete()
      .eq("id", id)
      .eq("user_id", userId) // Ensure user can only delete their own items

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
