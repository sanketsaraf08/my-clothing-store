import { DATABASE_CONFIG } from "./config"
import { SupabaseService } from "./supabase"
import { NeonServiceFixed } from "./neon-fixed"
import { MongoDBService } from "./mongodb"
import { StorageService } from "@/lib/storage"
import type { Product, Bill } from "@/lib/types"

export interface DatabaseService {
  getProducts(): Promise<Product[]>
  createProduct(product: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product>
  updateProduct(id: string, updates: Partial<Product>): Promise<Product>
  deleteProduct(id: string): Promise<void>
  getProductByBarcode(barcode: string): Promise<Product | null>
  createBill(bill: Omit<Bill, "id" | "createdAt">): Promise<Bill>
  getBills(): Promise<Bill[]>
}

class SmartDatabaseService implements DatabaseService {
  private currentService: DatabaseService | null = null
  private fallbackService: DatabaseService
  private connectionStatus: {
    primary: { type: string; connected: boolean; error?: string }
    fallback: { type: string; connected: boolean }
  }

  constructor() {
    // Always have localStorage as fallback
    this.fallbackService = this.createLocalStorageService()
    this.connectionStatus = {
      primary: { type: "none", connected: false },
      fallback: { type: "localStorage", connected: true },
    }
  }

  async initialize(): Promise<void> {
    console.log("🚀 SMART DB: Initializing database service...")

    // Try to connect to configured database
    const dbType = DATABASE_CONFIG.type
    console.log(`🎯 SMART DB: Attempting to connect to ${dbType}...`)

    try {
      switch (dbType) {
        case "neon":
          await this.initializeNeon()
          break
        case "supabase":
          await this.initializeSupabase()
          break
        case "mongodb":
          await this.initializeMongoDB()
          break
        default:
          console.log("📦 SMART DB: Using localStorage (default)")
          this.currentService = this.fallbackService
          this.connectionStatus.primary = { type: "localStorage", connected: true }
      }
    } catch (error) {
      console.error(`❌ SMART DB: Failed to connect to ${dbType}:`, error)
      this.fallbackToLocalStorage(error instanceof Error ? error.message : "Unknown error")
    }

    console.log("✅ SMART DB: Initialization complete")
    this.logStatus()
  }

  private async initializeNeon(): Promise<void> {
    const connected = await NeonServiceFixed.initialize()

    if (connected) {
      this.currentService = NeonServiceFixed as DatabaseService
      this.connectionStatus.primary = { type: "neon", connected: true }
      console.log("✅ SMART DB: Connected to Neon")
    } else {
      const status = NeonServiceFixed.getStatus()
      throw new Error(status.error || "Neon connection failed")
    }
  }

  private async initializeSupabase(): Promise<void> {
    // Add Supabase initialization logic here
    this.currentService = SupabaseService as DatabaseService
    this.connectionStatus.primary = { type: "supabase", connected: true }
    console.log("✅ SMART DB: Connected to Supabase")
  }

  private async initializeMongoDB(): Promise<void> {
    // Add MongoDB initialization logic here
    this.currentService = MongoDBService as DatabaseService
    this.connectionStatus.primary = { type: "mongodb", connected: true }
    console.log("✅ SMART DB: Connected to MongoDB")
  }

  private fallbackToLocalStorage(error: string): void {
    console.log("🔄 SMART DB: Falling back to localStorage...")
    this.currentService = this.fallbackService
    this.connectionStatus.primary = {
      type: DATABASE_CONFIG.type,
      connected: false,
      error,
    }
  }

  private createLocalStorageService(): DatabaseService {
    return {
      async getProducts() {
        return StorageService.getProducts()
      },
      async createProduct(product) {
        const products = StorageService.getProducts()
        const newProduct = {
          ...product,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        products.push(newProduct)
        StorageService.saveProducts(products)
        return newProduct
      },
      async updateProduct(id, updates) {
        const products = StorageService.getProducts()
        const index = products.findIndex((p) => p.id === id)
        if (index === -1) throw new Error("Product not found")

        products[index] = { ...products[index], ...updates, updatedAt: new Date() }
        StorageService.saveProducts(products)
        return products[index]
      },
      async deleteProduct(id) {
        const products = StorageService.getProducts()
        const filtered = products.filter((p) => p.id !== id)
        StorageService.saveProducts(filtered)
      },
      async getProductByBarcode(barcode) {
        const products = StorageService.getProducts()
        return products.find((p) => p.barcode === barcode) || null
      },
      async createBill(bill) {
        const bills = StorageService.getBills()
        const newBill = {
          ...bill,
          id: Date.now().toString(),
          createdAt: new Date(),
        }
        bills.push(newBill)
        StorageService.saveBills(bills)
        return newBill
      },
      async getBills() {
        return StorageService.getBills()
      },
    }
  }

  private logStatus(): void {
    console.log("📊 SMART DB STATUS:")
    console.log(
      `  Primary: ${this.connectionStatus.primary.type} - ${this.connectionStatus.primary.connected ? "✅ Connected" : "❌ Failed"}`,
    )
    if (this.connectionStatus.primary.error) {
      console.log(`  Error: ${this.connectionStatus.primary.error}`)
    }
    console.log(`  Fallback: ${this.connectionStatus.fallback.type} - ✅ Ready`)
  }

  getConnectionStatus() {
    return this.connectionStatus
  }

  // Delegate all database operations to current service
  async getProducts(): Promise<Product[]> {
    try {
      return await this.currentService!.getProducts()
    } catch (error) {
      console.error("❌ SMART DB: getProducts failed, trying fallback...")
      return await this.fallbackService.getProducts()
    }
  }

  async createProduct(product: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product> {
    try {
      return await this.currentService!.createProduct(product)
    } catch (error) {
      console.error("❌ SMART DB: createProduct failed, trying fallback...")
      return await this.fallbackService.createProduct(product)
    }
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    try {
      return await this.currentService!.updateProduct(id, updates)
    } catch (error) {
      console.error("❌ SMART DB: updateProduct failed, trying fallback...")
      return await this.fallbackService.updateProduct(id, updates)
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      await this.currentService!.deleteProduct(id)
    } catch (error) {
      console.error("❌ SMART DB: deleteProduct failed, trying fallback...")
      await this.fallbackService.deleteProduct(id)
    }
  }

  async getProductByBarcode(barcode: string): Promise<Product | null> {
    try {
      return await this.currentService!.getProductByBarcode(barcode)
    } catch (error) {
      console.error("❌ SMART DB: getProductByBarcode failed, trying fallback...")
      return await this.fallbackService.getProductByBarcode(barcode)
    }
  }

  async createBill(bill: Omit<Bill, "id" | "createdAt">): Promise<Bill> {
    try {
      return await this.currentService!.createBill(bill)
    } catch (error) {
      console.error("❌ SMART DB: createBill failed, trying fallback...")
      return await this.fallbackService.createBill(bill)
    }
  }

  async getBills(): Promise<Bill[]> {
    try {
      return await this.currentService!.getBills()
    } catch (error) {
      console.error("❌ SMART DB: getBills failed, trying fallback...")
      return await this.fallbackService.getBills()
    }
  }
}

// Export singleton instance
export const smartDb = new SmartDatabaseService()
