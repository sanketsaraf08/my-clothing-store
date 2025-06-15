import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const products = await db.getProducts()
    const product = products.find((p) => p.id === params.id)

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("API GET Error:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    console.log("API: Updating product:", params.id, body)

    // Validate required fields
    if (!body.name || body.price === undefined || body.quantity === undefined || !body.category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const updatedProduct = await db.updateProduct(params.id, {
      name: body.name,
      barcode: body.barcode,
      price: Number(body.price),
      quantity: Number(body.quantity),
      soldQuantity: body.soldQuantity,
      category: body.category,
      image: body.image,
    })

    console.log("API: Product updated successfully:", updatedProduct.id)
    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error("API PUT Error:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db.deleteProduct(params.id)
    console.log("API: Product deleted successfully:", params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API DELETE Error:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
