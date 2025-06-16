import { cloudDb } from "./cloud-service"
import { StorageService } from "@/lib/storage"
import type { Product, Bill } from "@/lib/types"

export class HybridDatabaseService {
  private static instance: HybridDatabaseService
  private useCloud = false
  private isInitialized = false

  static getInstance(): HybridDatabaseService {
    if (!HybridDatabaseService.instance) {
      HybridDatabaseService.instance = new HybridDatabaseService()
    }
    return HybridDatabaseService.instance
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    console.log("🔧 Initializing hybrid database service...")

    // Always ensure demo data exists locally
    StorageService.initializeDemoData()

    // Try to initialize cloud database
    try {
      this.useCloud = await cloudDb.initialize()
      if (this.useCloud) {
        console.log("🌐 Cloud database connected - using hybrid mode")
        // Sync local data to cloud on first connection
        await this.syncLocalToCloud()
      } else {
        console.log("💾 Cloud unavailable - using local storage only")
      }
    } catch (error) {
      console.warn("Cloud initialization failed, using local storage:", error)
      this.useCloud = false
    }

    this.isInitialized = true
    console.log("✅ Hybrid database service initialized")
  }

  private async syncLocalToCloud(): Promise<void> {
    try {
      const localProducts = StorageService.getProducts()
      const cloudProducts = await cloudDb.getProducts()

      console.log(`📊 Local products: ${localProducts.length}, Cloud products: ${cloudProducts.length}`)

      // Upload local products that don't exist in cloud
      for (const localProduct of localProducts) {
        const existsInCloud = cloudProducts.some((cp) => cp.barcode === localProduct.barcode)
        if (!existsInCloud) {
          console.log(`⬆️ Uploading product to cloud: ${localProduct.name}`)
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
    console.log("📦 Getting products...")

    try {
      if (this.useCloud) {
        console.log("🌐 Fetching from cloud...")
        const cloudProducts = await cloudDb.getProducts()
        console.log(`✅ Got ${cloudProducts.length} products from cloud`)

        // Also update local storage as backup
        StorageService.saveProducts(cloudProducts)
        return cloudProducts
      } else {
        console.log("💾 Fetching from local storage...")
        const localProducts = StorageService.getProducts()
        console.log(`✅ Got ${localProducts.length} products from local storage`)
        return localProducts
      }
    } catch (error) {
      console.error("❌ Error fetching products:", error)

      // Fallback to local storage
      console.log("🔄 Falling back to local storage...")
      const localProducts = StorageService.getProducts()
      console.log(`✅ Fallback: Got ${localProducts.length} products from local storage`)
      return localProducts
    }
  }

  async createProduct(product: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product> {
    console.log(`➕ Creating product: ${product.name}`)

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
    console.log(`✅ Product created locally: ${newProduct.name}`)

    // Try to sync to cloud
    if (this.useCloud) {
      try {
        console.log(`🌐 Syncing to cloud: ${product.name}`)
        const cloudProduct = await cloudDb.createProduct(product)
        if (cloudProduct) {
          // Update local with cloud ID
          const index = localProducts.findIndex((p) => p.barcode === product.barcode)
          if (index !== -1) {
            localProducts[index] = cloudProduct
            StorageService.saveProducts(localProducts)
            console.log(`✅ Product synced to cloud: ${cloudProduct.name}`)
          }
          return cloudProduct
        }
      } catch (error) {
        console.warn("Failed to sync product to cloud:", error)
      }
    }

    return newProduct
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    console.log(`📝 Updating product: ${id}`)

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
    console.log(`✅ Product updated locally: ${updatedProduct.name}`)

    // Try to sync to cloud
    if (this.useCloud) {
      try {
        await cloudDb.updateProduct(id, updates)
        console.log(`✅ Product synced to cloud: ${updatedProduct.name}`)
      } catch (error) {
        console.warn("Failed to sync product update to cloud:", error)
      }
    }

    return updatedProduct
  }

  async deleteProduct(id: string): Promise<void> {
    console.log(`🗑️ Deleting product: ${id}`)

    // Delete locally first
    const localProducts = StorageService.getProducts()
    const productToDelete = localProducts.find((p) => p.id === id)
    const filteredProducts = localProducts.filter((p) => p.id !== id)

    if (filteredProducts.length === localProducts.length) {
      throw new Error("Product not found")
    }

    StorageService.saveProducts(filteredProducts)
    console.log(`✅ Product deleted locally: ${productToDelete?.name}`)

    // Try to sync to cloud
    if (this.useCloud) {
      try {
        await cloudDb.deleteProduct(id)
        console.log(`✅ Product deleted from cloud: ${productToDelete?.name}`)
      } catch (error) {
        console.warn("Failed to delete product from cloud:", error)
      }
    }
  }

  // Bills
  async createBill(bill: Omit<Bill, "id" | "createdAt">): Promise<Bill> {
    console.log(`🧾 Creating bill with total: ${bill.total}`)

    // Create locally first
    const localBills = StorageService.getBills()
    const newBill: Bill = {
      ...bill,
      id: Date.now().toString(),
      createdAt: new Date(),
    }

    localBills.unshift(newBill)
    StorageService.saveBills(localBills)
    console.log(`✅ Bill created locally: ${newBill.id}`)

    // Try to sync to cloud
    if (this.useCloud) {
      try {
        const cloudBill = await cloudDb.createBill(bill)
        if (cloudBill) {
          // Update local with cloud ID
          const index = localBills.findIndex((b) => b.createdAt.getTime() === newBill.createdAt.getTime())
          if (index !== -1) {
            localBills[index] = cloudBill
            StorageService.saveBills(localBills)
            console.log(`✅ Bill synced to cloud: ${cloudBill.id}`)
          }
          return cloudBill
        }
      } catch (error) {
        console.warn("Failed to sync bill to cloud:", error)
      }
    }

    return newBill
  }

  async getBills(): Promise<Bill[]> {
    console.log("🧾 Getting bills...")

    try {
      if (this.useCloud) {
        const cloudBills = await cloudDb.getBills()
        console.log(`✅ Got ${cloudBills.length} bills from cloud`)

        // Also update local storage as backup
        StorageService.saveBills(cloudBills)
        return cloudBills
      } else {
        const localBills = StorageService.getBills()
        console.log(`✅ Got ${localBills.length} bills from local storage`)
        return localBills
      }
    } catch (error) {
      console.error("Error fetching bills:", error)

      // Fallback to local storage
      const localBills = StorageService.getBills()
      console.log(`✅ Fallback: Got ${localBills.length} bills from local storage`)
      return localBills
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

  // Force reload demo products
  reloadDemoProducts(): void {
    console.log("🔄 Reloading demo products...")
    StorageService.clearAll()
    StorageService.initializeDemoData()
    console.log("✅ Demo products reloaded")
  }
}

export const db = HybridDatabaseService.getInstance()
