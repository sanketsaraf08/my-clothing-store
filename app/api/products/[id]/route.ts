import { type NextRequest, NextResponse } from "next/server"
import { StorageService } from "@/lib/storage"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const products = StorageService.getProducts()
    const index = products.findIndex((p) => p.id === params.id)

    if (index === -1) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    products[index] = {
      ...products[index],
      ...body,
      updatedAt: new Date(),
    }

    StorageService.saveProducts(products)
    return NextResponse.json(products[index])
  } catch (error) {
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const products = StorageService.getProducts()
    const filteredProducts = products.filter((p) => p.id !== params.id)

    if (products.length === filteredProducts.length) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    StorageService.saveProducts(filteredProducts)
    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
