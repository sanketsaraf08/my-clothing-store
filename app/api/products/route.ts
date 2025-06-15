import { type NextRequest, NextResponse } from "next/server"
import { StorageService } from "@/lib/storage"
import { generateId } from "@/lib/utils"

export async function GET() {
  try {
    const products = StorageService.getProducts()
    return NextResponse.json(products)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.price || !body.quantity || !body.category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const products = StorageService.getProducts()

    const newProduct = {
      id: generateId(),
      name: body.name,
      barcode: body.barcode || StorageService.generateBarcode(),
      price: Number(body.price),
      quantity: Number(body.quantity),
      soldQuantity: body.soldQuantity || 0,
      category: body.category,
      image: body.image || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    products.push(newProduct)
    StorageService.saveProducts(products)

    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
