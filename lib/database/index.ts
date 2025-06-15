import { DATABASE_CONFIG } from "./config"
import { SupabaseService } from "./supabase"
import { NeonService } from "./neon"
import { MongoDBService } from "./mongodb"
import { StorageService } from "@/lib/storage"
import type { Product, Bill } from "@/lib/types"

// Universal database interface
export interface DatabaseService {
  // Products
  getProducts(): Promise<Product[]>
  createProduct(product: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product>
  updateProduct(id: string, updates: Partial<Product>): Promise<Product>
  deleteProduct(id: string): Promise<void>
  getProductByBarcode(barcode: string): Promise<Product | null>

  // Bills
  createBill(bill: Omit<Bill, "id" | "createdAt">): Promise<Bill>
  getBills(): Promise<Bill[]>
}

// Database factory - returns the appropriate service based on configuration
export function getDatabaseService(): DatabaseService {
  switch (DATABASE_CONFIG.type) {
    case "supabase":
      return SupabaseService as DatabaseService
    case "neon":
      return NeonService as DatabaseService
    case "mongodb":
      return MongoDBService as DatabaseService
    case "localStorage":
    default:
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
}

// Convenience export
export const db = getDatabaseService()
