import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const updatedProduct = await db.updateProduct(params.id, body)
    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error("API PUT Error:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db.deleteProduct(params.id)
    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("API DELETE Error:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
