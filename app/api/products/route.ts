import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function GET() {
  try {
    console.log("API: Fetching products...")
    const products = await db.getProducts()
    console.log(`API: Found ${products.length} products`)
    return NextResponse.json(products)
  } catch (error) {
    console.error("API GET Error:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("API: Creating product with data:", body)

    // Validate required fields
    if (!body.name || body.price === undefined || body.quantity === undefined || !body.category) {
      console.error("API: Missing required fields:", {
        name: body.name,
        price: body.price,
        quantity: body.quantity,
        category: body.category,
      })
      return NextResponse.json(
        { error: "Missing required fields: name, price, quantity, and category are required" },
        { status: 400 },
      )
    }

    // Validate data types
    const price = Number(body.price)
    const quantity = Number(body.quantity)

    if (isNaN(price) || price < 0) {
      return NextResponse.json({ error: "Price must be a valid positive number" }, { status: 400 })
    }

    if (isNaN(quantity) || quantity < 0) {
      return NextResponse.json({ error: "Quantity must be a valid positive number" }, { status: 400 })
    }

    const productData = {
      name: body.name.trim(),
      barcode: body.barcode || db.generateBarcode(),
      price: price,
      quantity: quantity,
      soldQuantity: body.soldQuantity || 0,
      category: body.category,
      image: body.image?.trim() || undefined,
    }

    console.log("API: Creating product with validated data:", productData)

    const newProduct = await db.createProduct(productData)

    console.log("API: Product created successfully:", newProduct.id)
    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    console.error("API POST Error:", error)
    return NextResponse.json(
      {
        error: "Failed to create product",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
