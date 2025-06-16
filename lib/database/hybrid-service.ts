import { cloudDb } from "./cloud-service"
import { StorageService } from "@/lib/storage"
import type { Product, Bill } from "@/lib/types"

export class HybridDatabaseService {
  private static instance: HybridDatabaseService
  private useCloud = false

  static getInstance(): HybridDatabaseService {
    if (!HybridDatabaseService.instance) {
      HybridDatabaseService.instance = new HybridDatabaseService()
    }
    return HybridDatabaseService.instance
  }

  async initialize(): Promise<void> {
    // Try to initialize cloud database
    this.useCloud = await cloudDb.initialize()

    if (this.useCloud) {
      console.log("🌐 Using cloud database")
      // Sync local data to cloud on first connection
      await this.syncLocalToCloud()
    } else {
      console.log("💾 Using local storage")
    }
  }

  private async syncLocalToCloud(): Promise<void> {
    try {
      const localProducts = StorageService.getProducts()
      const cloudProducts = await cloudDb.getProducts()

      // Upload local products that don't exist in cloud
      for (const localProduct of localProducts) {
        const existsInCloud = cloudProducts.some((cp) => cp.barcode === localProduct.barcode)
        if (!existsInCloud) {
          await cloudDb.createProduct({
            name: localProduct.name,
            barcode: localProduct.barcode,
            price: localProduct.price,
            quantity: localProduct.quantity,
            soldQuantity: localProduct.soldQuantity,
            category: localProduct.category,
            image: localProduct.image,
          })
        }
      }
    } catch (error) {
      console.warn("Failed to sync local data to cloud:", error)
    }
  }

  // Products
  async getProducts(): Promise<Product[]> {
    if (this.useCloud) {
      const cloudProducts = await cloudDb.getProducts()
      // Also update local storage as backup
      StorageService.saveProducts(cloudProducts)
      return cloudProducts
    } else {
      return StorageService.getProducts()
    }
  }

  async createProduct(product: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product> {
    // Create locally first for instant response
    const localProducts = StorageService.getProducts()
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    localProducts.unshift(newProduct)
    StorageService.saveProducts(localProducts)

    // Try to sync to cloud
    if (this.useCloud) {
      const cloudProduct = await cloudDb.createProduct(product)
      if (cloudProduct) {
        // Update local with cloud ID
        const index = localProducts.findIndex((p) => p.barcode === product.barcode)
        if (index !== -1) {
          localProducts[index] = cloudProduct
          StorageService.saveProducts(localProducts)
        }
        return cloudProduct
      }
    }

    return newProduct
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    // Update locally first
    const localProducts = StorageService.getProducts()
    const index = localProducts.findIndex((p) => p.id === id)

    if (index === -1) throw new Error("Product not found")

    const updatedProduct = {
      ...localProducts[index],
      ...updates,
      updatedAt: new Date(),
    }

    localProducts[index] = updatedProduct
    StorageService.saveProducts(localProducts)

    // Try to sync to cloud
    if (this.useCloud) {
      await cloudDb.updateProduct(id, updates)
    }

    return updatedProduct
  }

  async deleteProduct(id: string): Promise<void> {
    // Delete locally first
    const localProducts = StorageService.getProducts()
    const filteredProducts = localProducts.filter((p) => p.id !== id)

    if (filteredProducts.length === localProducts.length) {
      throw new Error("Product not found")
    }

    StorageService.saveProducts(filteredProducts)

    // Try to sync to cloud
    if (this.useCloud) {
      await cloudDb.deleteProduct(id)
    }
  }

  // Bills
  async createBill(bill: Omit<Bill, "id" | "createdAt">): Promise<Bill> {
    // Create locally first
    const localBills = StorageService.getBills()
    const newBill: Bill = {
      ...bill,
      id: Date.now().toString(),
      createdAt: new Date(),
    }

    localBills.unshift(newBill)
    StorageService.saveBills(localBills)

    // Try to sync to cloud
    if (this.useCloud) {
      const cloudBill = await cloudDb.createBill(bill)
      if (cloudBill) {
        // Update local with cloud ID
        const index = localBills.findIndex((b) => b.createdAt.getTime() === newBill.createdAt.getTime())
        if (index !== -1) {
          localBills[index] = cloudBill
          StorageService.saveBills(localBills)
        }
        return cloudBill
      }
    }

    return newBill
  }

  async getBills(): Promise<Bill[]> {
    if (this.useCloud) {
      const cloudBills = await cloudDb.getBills()
      // Also update local storage as backup
      StorageService.saveBills(cloudBills)
      return cloudBills
    } else {
      return StorageService.getBills()
    }
  }

  // Real-time subscriptions (only work with cloud)
  subscribeToProducts(callback: (products: Product[]) => void): () => void {
    if (this.useCloud) {
      return cloudDb.subscribeToProducts(callback)
    }
    return () => {}
  }

  subscribeToSales(callback: (bills: Bill[]) => void): () => void {
    if (this.useCloud) {
      return cloudDb.subscribeToSales(callback)
    }
    return () => {}
  }

  isCloudConnected(): boolean {
    return this.useCloud
  }
}

export const db = HybridDatabaseService.getInstance()
