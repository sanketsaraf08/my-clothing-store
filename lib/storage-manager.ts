import { SupabaseService } from "@/lib/database/supabase"
import type { Product, Bill } from "./types"

export class StorageManager {
  private static instance: StorageManager

  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager()
    }
    return StorageManager.instance
  }

  async initialize(): Promise<void> {
    console.log("🚀 Supabase-based StorageManager initialized")
  }

  async getProducts(): Promise<Product[]> {
    return SupabaseService.getProducts()
  }

  async createProduct(productData: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product> {
    return SupabaseService.createProduct(productData)
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    return SupabaseService.updateProduct(id, updates)
  }

  async deleteProduct(id: string): Promise<void> {
    return SupabaseService.deleteProduct(id)
  }

  async getProductByBarcode(barcode: string): Promise<Product | null> {
    return SupabaseService.getProductByBarcode(barcode)
  }

  async getBills(): Promise<Bill[]> {
    return SupabaseService.getBills()
  }

  async createBill(billData: Omit<Bill, "id" | "createdAt">): Promise<Bill> {
    return SupabaseService.createBill(billData)
  }

  generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  generateBarcode(): string {
    return `MF${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`
  }

  clearAllData(): void {
    console.warn("🛑 Not supported with Supabase: Use SQL TRUNCATE from dashboard or manually delete records.")
  }

  reloadDemoProducts(): void {
    console.warn("ℹ️ Not supported with Supabase: Use seeding scripts if needed.")
  }

  getDebugInfo(): any {
    return {
      storageBackend: "Supabase",
      timestamp: new Date().toISOString(),
    }
  }
}
