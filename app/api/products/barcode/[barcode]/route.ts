import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { barcode: string } }) {
  try {
    console.log("API: Looking up product by barcode:", params.barcode)
    const product = await db.getProductByBarcode(params.barcode)

    if (!product) {
      console.log("API: Product not found for barcode:", params.barcode)
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    console.log("API: Found product:", product.name)
    return NextResponse.json(product)
  } catch (error) {
    console.error("API GET Error:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}
