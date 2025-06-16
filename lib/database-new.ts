import { StorageManager } from "./storage-manager"
import type { Product, Bill } from "./types"

// Bulletproof database service
export class DatabaseService {
  private storage = StorageManager.getInstance()

  async initialize(): Promise<void> {
    console.log("🚀 DATABASE SERVICE: Initializing...")
    await this.storage.initialize()
    console.log("✅ DATABASE SERVICE: Ready")
  }

  async getProducts(): Promise<Product[]> {
    console.log("📦 DATABASE: Getting products...")
    const products = await this.storage.getProducts()

    // Convert string dates back to Date objects
    const convertedProducts = products.map((p) => ({
      ...p,
      createdAt: new Date(p.createdAt),
      updatedAt: new Date(p.updatedAt),
    }))

    console.log(`✅ DATABASE: Returning ${convertedProducts.length} products`)
    return convertedProducts
  }

  async createProduct(productData: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product> {
    console.log("➕ DATABASE: Creating product:", productData.name)

    const product = await this.storage.createProduct({
      ...productData,
      barcode: productData.barcode || this.generateBarcode(),
    })

    const convertedProduct = {
      ...product,
      createdAt: new Date(product.createdAt),
      updatedAt: new Date(product.updatedAt),
    }

    console.log("✅ DATABASE: Product created:", convertedProduct.id)
    return convertedProduct
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    console.log("✏️ DATABASE: Updating product:", id)

    const product = await this.storage.updateProduct(id, updates)

    const convertedProduct = {
      ...product,
      createdAt: new Date(product.createdAt),
      updatedAt: new Date(product.updatedAt),
    }

    console.log("✅ DATABASE: Product updated:", convertedProduct.id)
    return convertedProduct
  }

  async deleteProduct(id: string): Promise<void> {
    console.log("🗑️ DATABASE: Deleting product:", id)
    await this.storage.deleteProduct(id)
    console.log("✅ DATABASE: Product deleted")
  }

  async getProductByBarcode(barcode: string): Promise<Product | null> {
    console.log("🔍 DATABASE: Looking up barcode:", barcode)

    const product = await this.storage.getProductByBarcode(barcode)

    if (!product) {
      console.log("❌ DATABASE: Product not found for barcode:", barcode)
      return null
    }

    const convertedProduct = {
      ...product,
      createdAt: new Date(product.createdAt),
      updatedAt: new Date(product.updatedAt),
    }

    console.log("✅ DATABASE: Product found:", convertedProduct.name)
    return convertedProduct
  }

  async createBill(billData: Omit<Bill, "id" | "createdAt">): Promise<Bill> {
    console.log("🧾 DATABASE: Creating bill...")

    const bill = await this.storage.createBill(billData)

    const convertedBill = {
      ...bill,
      createdAt: new Date(bill.createdAt),
    }

    console.log("✅ DATABASE: Bill created:", convertedBill.id)
    return convertedBill
  }

  async getBills(): Promise<Bill[]> {
    console.log("🧾 DATABASE: Getting bills...")

    const bills = await this.storage.getBills()

    const convertedBills = bills.map((b) => ({
      ...b,
      createdAt: new Date(b.createdAt),
    }))

    console.log(`✅ DATABASE: Returning ${convertedBills.length} bills`)
    return convertedBills
  }

  generateBarcode(): string {
    return this.storage.generateBarcode()
  }

  generateId(): string {
    return this.storage.generateId()
  }

  clearAllData(): void {
    console.log("🗑️ DATABASE: Clearing all data...")
    this.storage.clearAllData()
    console.log("✅ DATABASE: All data cleared")
  }

  reloadDemoProducts(): void {
    console.log("🔄 DATABASE: Reloading demo products...")
    this.storage.reloadDemoProducts()
    console.log("✅ DATABASE: Demo products reloaded")
  }

  getDebugInfo(): any {
    return this.storage.getDebugInfo()
  }
}

// Export singleton instance
export const db = new DatabaseService()
