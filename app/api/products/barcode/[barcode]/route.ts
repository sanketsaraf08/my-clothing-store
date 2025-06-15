import { type NextRequest, NextResponse } from "next/server"
import { StorageService } from "@/lib/storage"

export async function GET(request: NextRequest, { params }: { params: { barcode: string } }) {
  try {
    const products = StorageService.getProducts()
    const product = products.find((p) => p.barcode === params.barcode)

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}
