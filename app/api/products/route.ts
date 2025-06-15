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
    const products = StorageService.getProducts()

    const newProduct = {
      ...body,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    products.push(newProduct)
    StorageService.saveProducts(products)

    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
