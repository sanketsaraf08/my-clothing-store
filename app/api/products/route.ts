import { type NextRequest, NextResponse } from "next/server"
import { StorageService } from "@/lib/storage"
import { generateId } from "@/lib/utils"

export async function GET() {
  try {
    const products = StorageService.getProducts()
    console.log("API GET: Returning products:", products.length)
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

    const products = StorageService.getProducts()
    console.log("API POST: Current products count:", products.length)

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

    console.log("API POST: Creating new product:", newProduct)

    products.push(newProduct)
    StorageService.saveProducts(products)

    console.log("API POST: Products after save:", products.length)

    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    console.error("API POST Error:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
