import { SupabaseService } from "@/lib/database/supabase"
import { StorageService } from "@/lib/storage"
import type { Product, Bill } from "@/lib/types"

export class CloudSyncService {
  private static instance: CloudSyncService
  private syncInterval: NodeJS.Timeout | null = null
  private isOnline = true
  private lastSyncTime = 0
  private syncInProgress = false
  private listeners: Array<(event: SyncEvent) => void> = []

  static getInstance(): CloudSyncService {
    if (!CloudSyncService.instance) {
      CloudSyncService.instance = new CloudSyncService()
    }
    return CloudSyncService.instance
  }

  async initialize(): Promise<void> {
    console.log("🔄 CLOUD SYNC: Initializing...")

    // Check if we can connect to cloud
    await this.checkCloudConnection()

    // Start sync interval
    this.startSyncInterval()

    // Listen for online/offline events
    this.setupNetworkListeners()

    // Initial sync
    await this.performFullSync()

    console.log("✅ CLOUD SYNC: Initialized successfully")
  }

  private async checkCloudConnection(): Promise<boolean> {
    try {
      // Test Supabase connection
      await SupabaseService.getProducts()
      this.isOnline = true
      console.log("✅ CLOUD SYNC: Cloud connection established")
      return true
    } catch (error) {
      this.isOnline = false
      console.warn("⚠️ CLOUD SYNC: Cloud connection failed, working offline")
      return false
    }
  }

  private startSyncInterval(): void {
    // Sync every 10 seconds
    this.syncInterval = setInterval(async () => {
      if (!this.syncInProgress && this.isOnline) {
        await this.performIncrementalSync()
      }
    }, 10000)
  }

  private setupNetworkListeners(): void {
    if (typeof window !== "undefined") {
      window.addEventListener("online", async () => {
        console.log("🌐 CLOUD SYNC: Back online, syncing...")
        this.isOnline = true
        await this.performFullSync()
      })

      window.addEventListener("offline", () => {
        console.log("📱 CLOUD SYNC: Offline mode")
        this.isOnline = false
      })
    }
  }

  async performFullSync(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) return

    this.syncInProgress = true
    console.log("🔄 CLOUD SYNC: Starting full sync...")

    try {
      // Sync products
      await this.syncProducts()

      // Sync bills
      await this.syncBills()

      this.lastSyncTime = Date.now()
      this.notifyListeners({ type: "sync_complete", timestamp: this.lastSyncTime })

      console.log("✅ CLOUD SYNC: Full sync completed")
    } catch (error) {
      console.error("❌ CLOUD SYNC: Full sync failed:", error)
      this.notifyListeners({ type: "sync_error", error: error instanceof Error ? error.message : "Unknown error" })
    } finally {
      this.syncInProgress = false
    }
  }

  private async performIncrementalSync(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) return

    try {
      // Quick check for changes
      const cloudProducts = await SupabaseService.getProducts()
      const localProducts = StorageService.getProducts()

      // Compare counts and timestamps
      if (cloudProducts.length !== localProducts.length) {
        console.log("🔄 CLOUD SYNC: Changes detected, performing sync...")
        await this.performFullSync()
      }
    } catch (error) {
      console.warn("⚠️ CLOUD SYNC: Incremental sync check failed:", error)
    }
  }

  private async syncProducts(): Promise<void> {
    console.log("📦 CLOUD SYNC: Syncing products...")

    try {
      // Get data from both sources
      const cloudProducts = await SupabaseService.getProducts()
      const localProducts = StorageService.getProducts()

      // Create maps for easier comparison
      const cloudMap = new Map(cloudProducts.map((p) => [p.id, p]))
      const localMap = new Map(localProducts.map((p) => [p.id, p]))

      let changes = 0

      // Upload local products that don't exist in cloud
      for (const localProduct of localProducts) {
        if (!cloudMap.has(localProduct.id)) {
          console.log(`⬆️ CLOUD SYNC: Uploading product ${localProduct.name}`)
          try {
            await SupabaseService.createProduct({
              name: localProduct.name,
              barcode: localProduct.barcode,
              price: localProduct.price,
              quantity: localProduct.quantity,
              soldQuantity: localProduct.soldQuantity,
              category: localProduct.category,
              image: localProduct.image,
            })
            changes++
          } catch (error) {
            console.warn(`⚠️ CLOUD SYNC: Failed to upload product ${localProduct.name}:`, error)
          }
        }
      }

      // Download cloud products that don't exist locally
      for (const cloudProduct of cloudProducts) {
        if (!localMap.has(cloudProduct.id)) {
          console.log(`⬇️ CLOUD SYNC: Downloading product ${cloudProduct.name}`)
          localProducts.push(cloudProduct)
          changes++
        }
      }

      // Update local storage if there were changes
      if (changes > 0) {
        StorageService.saveProducts(localProducts)
        this.notifyListeners({
          type: "products_updated",
          count: changes,
          products: localProducts,
        })
        console.log(`✅ CLOUD SYNC: ${changes} product changes synced`)
      }
    } catch (error) {
      console.error("❌ CLOUD SYNC: Product sync failed:", error)
      throw error
    }
  }

  private async syncBills(): Promise<void> {
    console.log("🧾 CLOUD SYNC: Syncing bills...")

    try {
      const cloudBills = await SupabaseService.getBills()
      const localBills = StorageService.getBills()

      const cloudMap = new Map(cloudBills.map((b) => [b.id, b]))
      const localMap = new Map(localBills.map((b) => [b.id, b]))

      let changes = 0

      // Upload local bills that don't exist in cloud
      for (const localBill of localBills) {
        if (!cloudMap.has(localBill.id)) {
          console.log(`⬆️ CLOUD SYNC: Uploading bill ${localBill.id}`)
          try {
            await SupabaseService.createBill({
              items: localBill.items,
              total: localBill.total,
              subtotal: localBill.subtotal,
              discount: localBill.discount,
              customerPhone: localBill.customerPhone,
              qrCode: localBill.qrCode,
              upiId: localBill.upiId,
            })
            changes++
          } catch (error) {
            console.warn(`⚠️ CLOUD SYNC: Failed to upload bill ${localBill.id}:`, error)
          }
        }
      }

      // Download cloud bills that don't exist locally
      for (const cloudBill of cloudBills) {
        if (!localMap.has(cloudBill.id)) {
          console.log(`⬇️ CLOUD SYNC: Downloading bill ${cloudBill.id}`)
          localBills.push(cloudBill)
          changes++
        }
      }

      if (changes > 0) {
        StorageService.saveBills(localBills)
        this.notifyListeners({
          type: "bills_updated",
          count: changes,
          bills: localBills,
        })
        console.log(`✅ CLOUD SYNC: ${changes} bill changes synced`)
      }
    } catch (error) {
      console.error("❌ CLOUD SYNC: Bill sync failed:", error)
      throw error
    }
  }

  // Public API for manual operations
  async createProduct(productData: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product> {
    console.log("➕ CLOUD SYNC: Creating product with sync...")

    // Create locally first for instant response
    const localProducts = StorageService.getProducts()
    const newProduct: Product = {
      ...productData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    localProducts.unshift(newProduct)
    StorageService.saveProducts(localProducts)

    // Sync to cloud in background
    if (this.isOnline) {
      try {
        await SupabaseService.createProduct(productData)
        console.log("✅ CLOUD SYNC: Product synced to cloud")
      } catch (error) {
        console.warn("⚠️ CLOUD SYNC: Failed to sync product to cloud:", error)
        // Product is still saved locally, will sync later
      }
    }

    this.notifyListeners({
      type: "product_created",
      product: newProduct,
    })

    return newProduct
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    console.log("✏️ CLOUD SYNC: Updating product with sync...")

    // Update locally first
    const localProducts = StorageService.getProducts()
    const index = localProducts.findIndex((p) => p.id === id)

    if (index === -1) {
      throw new Error("Product not found")
    }

    const updatedProduct = {
      ...localProducts[index],
      ...updates,
      updatedAt: new Date(),
    }

    localProducts[index] = updatedProduct
    StorageService.saveProducts(localProducts)

    // Sync to cloud in background
    if (this.isOnline) {
      try {
        await SupabaseService.updateProduct(id, updates)
        console.log("✅ CLOUD SYNC: Product update synced to cloud")
      } catch (error) {
        console.warn("⚠️ CLOUD SYNC: Failed to sync product update to cloud:", error)
      }
    }

    this.notifyListeners({
      type: "product_updated",
      product: updatedProduct,
    })

    return updatedProduct
  }

  async deleteProduct(id: string): Promise<void> {
    console.log("🗑️ CLOUD SYNC: Deleting product with sync...")

    // Delete locally first
    const localProducts = StorageService.getProducts()
    const filteredProducts = localProducts.filter((p) => p.id !== id)

    if (filteredProducts.length === localProducts.length) {
      throw new Error("Product not found")
    }

    StorageService.saveProducts(filteredProducts)

    // Sync to cloud in background
    if (this.isOnline) {
      try {
        await SupabaseService.deleteProduct(id)
        console.log("✅ CLOUD SYNC: Product deletion synced to cloud")
      } catch (error) {
        console.warn("⚠️ CLOUD SYNC: Failed to sync product deletion to cloud:", error)
      }
    }

    this.notifyListeners({
      type: "product_deleted",
      productId: id,
    })
  }

  async createBill(billData: Omit<Bill, "id" | "createdAt">): Promise<Bill> {
    console.log("🧾 CLOUD SYNC: Creating bill with sync...")

    // Create locally first
    const localBills = StorageService.getBills()
    const newBill: Bill = {
      ...billData,
      id: this.generateId(),
      createdAt: new Date(),
    }

    localBills.unshift(newBill)
    StorageService.saveBills(localBills)

    // Sync to cloud in background
    if (this.isOnline) {
      try {
        await SupabaseService.createBill(billData)
        console.log("✅ CLOUD SYNC: Bill synced to cloud")
      } catch (error) {
        console.warn("⚠️ CLOUD SYNC: Failed to sync bill to cloud:", error)
      }
    }

    this.notifyListeners({
      type: "bill_created",
      bill: newBill,
    })

    return newBill
  }

  // Event system for real-time updates
  onSync(callback: (event: SyncEvent) => void): () => void {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback)
    }
  }

  private notifyListeners(event: SyncEvent): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event)
      } catch (error) {
        console.error("❌ CLOUD SYNC: Listener error:", error)
      }
    })
  }

  // Utility methods
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  getStatus(): SyncStatus {
    return {
      isOnline: this.isOnline,
      lastSyncTime: this.lastSyncTime,
      syncInProgress: this.syncInProgress,
    }
  }

  async forcSync(): Promise<void> {
    await this.performFullSync()
  }

  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
    this.listeners = []
  }
}

// Types
export interface SyncEvent {
  type:
    | "sync_complete"
    | "sync_error"
    | "products_updated"
    | "bills_updated"
    | "product_created"
    | "product_updated"
    | "product_deleted"
    | "bill_created"
  timestamp?: number
  error?: string
  count?: number
  products?: Product[]
  bills?: Bill[]
  product?: Product
  bill?: Bill
  productId?: string
}

export interface SyncStatus {
  isOnline: boolean
  lastSyncTime: number
  syncInProgress: boolean
}
