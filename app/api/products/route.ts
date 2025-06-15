import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function GET() {
  try {
    const products = await db.getProducts()
    return NextResponse.json(products)
  } catch (error) {
    console.error("API GET Error:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("API POST: Received data:", body)

    // Validate required fields
    if (!body.name || !body.price || !body.quantity || !body.category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newProduct = await db.createProduct({
      name: body.name,
      barcode: body.barcode || `${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
      price: Number(body.price),
      quantity: Number(body.quantity),
      soldQuantity: body.soldQuantity || 0,
      category: body.category,
      image: body.image || undefined,
    })

    console.log("API POST: Created product:", newProduct)
    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    console.error("API POST Error:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
