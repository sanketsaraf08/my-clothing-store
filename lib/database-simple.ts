import { StorageService } from "./storage"
import type { Product, Bill } from "./types"

export class DatabaseService {
  private static instance: DatabaseService

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }
    return DatabaseService.instance
  }

  async initialize(): Promise<void> {
    console.log("🔧 Database service initialized")
    // Ensure we have some products
    const products = StorageService.getProducts()
    if (products.length === 0) {
      console.log("📦 No products found, loading defaults...")
    }
  }

  async getProducts(): Promise<Product[]> {
    return StorageService.getProducts()
  }

  async createProduct(product: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product> {
    const products = StorageService.getProducts()
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    products.unshift(newProduct)
    StorageService.saveProducts(products)
    return newProduct
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const products = StorageService.getProducts()
    const index = products.findIndex((p) => p.id === id)

    if (index === -1) throw new Error("Product not found")

    const updatedProduct = {
      ...products[index],
      ...updates,
      updatedAt: new Date(),
    }

    products[index] = updatedProduct
    StorageService.saveProducts(products)
    return updatedProduct
  }

  async deleteProduct(id: string): Promise<void> {
    const products = StorageService.getProducts()
    const filteredProducts = products.filter((p) => p.id !== id)

    if (filteredProducts.length === products.length) {
      throw new Error("Product not found")
    }

    StorageService.saveProducts(filteredProducts)
  }

  async getBills(): Promise<Bill[]> {
    return StorageService.getBills()
  }

  async createBill(bill: Omit<Bill, "id" | "createdAt">): Promise<Bill> {
    const bills = StorageService.getBills()
    const newBill: Bill = {
      ...bill,
      id: Date.now().toString(),
      createdAt: new Date(),
    }

    bills.unshift(newBill)
    StorageService.saveBills(bills)
    return newBill
  }

  generateBarcode(): string {
    return StorageService.generateBarcode()
  }

  reloadDemoProducts(): void {
    StorageService.reloadDemoProducts()
  }

  clearAllData(): void {
    StorageService.clearAll()
  }

  getDebugInfo(): any {
    const products = StorageService.getProducts()
    const bills = StorageService.getBills()

    return {
      supabaseConfigured: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      localStorage: {
        isAvailable: typeof window !== "undefined" && !!window.localStorage,
        productsCount: products.length,
        billsCount: bills.length,
        demoLoaded: products.length > 0,
        storageUsed: typeof window !== "undefined" ? `${JSON.stringify(products).length} chars` : "0 chars",
      },
    }
  }
}

export const db = DatabaseService.getInstance()
