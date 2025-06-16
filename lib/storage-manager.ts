// Bulletproof storage manager that handles all edge cases
export class StorageManager {
  private static instance: StorageManager
  private isInitialized = false
  private products: any[] = []
  private bills: any[] = []

  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager()
    }
    return StorageManager.instance
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    console.log("🚀 STORAGE MANAGER: Starting initialization...")

    try {
      // Test storage availability
      const storageTest = this.testStorage()
      console.log("📱 STORAGE TEST:", storageTest)

      // Load existing data
      await this.loadData()

      // If no products exist, load demo data
      if (this.products.length === 0) {
        console.log("📦 LOADING DEMO PRODUCTS...")
        this.loadDemoProducts()
      }

      this.isInitialized = true
      console.log("✅ STORAGE MANAGER: Initialization complete")
      console.log(`📊 LOADED: ${this.products.length} products, ${this.bills.length} bills`)
    } catch (error) {
      console.error("❌ STORAGE MANAGER: Initialization failed:", error)
      // Even if initialization fails, we'll work with in-memory data
      this.isInitialized = true
      this.loadDemoProducts()
    }
  }

  private testStorage(): { localStorage: boolean; sessionStorage: boolean; memory: boolean } {
    const result = {
      localStorage: false,
      sessionStorage: false,
      memory: true, // Always available
    }

    // Test localStorage
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const testKey = "__storage_test__"
        localStorage.setItem(testKey, "test")
        localStorage.removeItem(testKey)
        result.localStorage = true
      }
    } catch (e) {
      console.warn("⚠️ localStorage not available:", e)
    }

    // Test sessionStorage
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        const testKey = "__session_test__"
        sessionStorage.setItem(testKey, "test")
        sessionStorage.removeItem(testKey)
        result.sessionStorage = true
      }
    } catch (e) {
      console.warn("⚠️ sessionStorage not available:", e)
    }

    return result
  }

  private async loadData(): Promise<void> {
    console.log("📂 LOADING DATA FROM STORAGE...")

    // Try localStorage first
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const productsData = localStorage.getItem("moraya_products")
        const billsData = localStorage.getItem("moraya_bills")

        if (productsData) {
          this.products = JSON.parse(productsData)
          console.log(`📦 Loaded ${this.products.length} products from localStorage`)
        }

        if (billsData) {
          this.bills = JSON.parse(billsData)
          console.log(`🧾 Loaded ${this.bills.length} bills from localStorage`)
        }
      }
    } catch (error) {
      console.warn("⚠️ Failed to load from localStorage:", error)
    }

    // Try sessionStorage as fallback
    if (this.products.length === 0) {
      try {
        if (typeof window !== "undefined" && window.sessionStorage) {
          const productsData = sessionStorage.getItem("moraya_products")
          if (productsData) {
            this.products = JSON.parse(productsData)
            console.log(`📦 Loaded ${this.products.length} products from sessionStorage`)
          }
        }
      } catch (error) {
        console.warn("⚠️ Failed to load from sessionStorage:", error)
      }
    }
  }

  private saveData(): void {
    console.log("💾 SAVING DATA TO STORAGE...")

    // Save to localStorage
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem("moraya_products", JSON.stringify(this.products))
        localStorage.setItem("moraya_bills", JSON.stringify(this.bills))
        console.log("✅ Data saved to localStorage")
      }
    } catch (error) {
      console.warn("⚠️ Failed to save to localStorage:", error)
    }

    // Save to sessionStorage as backup
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        sessionStorage.setItem("moraya_products", JSON.stringify(this.products))
        sessionStorage.setItem("moraya_bills", JSON.stringify(this.bills))
        console.log("✅ Data saved to sessionStorage")
      }
    } catch (error) {
      console.warn("⚠️ Failed to save to sessionStorage:", error)
    }

    // Trigger storage event for cross-tab sync
    try {
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("moraya_data_updated", {
            detail: { products: this.products.length, bills: this.bills.length },
          }),
        )
      }
    } catch (error) {
      console.warn("⚠️ Failed to trigger storage event:", error)
    }
  }

  private loadDemoProducts(): void {
    console.log("🎯 LOADING DEMO PRODUCTS...")

    const demoProducts = [
      {
        id: this.generateId(),
        name: "Premium Cotton Shirt - Blue",
        barcode: "MF001234567890",
        price: 1299,
        quantity: 25,
        soldQuantity: 5,
        category: "shirts",
        image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: this.generateId(),
        name: "Designer Kurta - White",
        barcode: "MF001234567891",
        price: 1899,
        quantity: 15,
        soldQuantity: 3,
        category: "shirts",
        image: "https://images.unsplash.com/photo-1583743814966-8936f37f8302?w=400&h=400&fit=crop",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: this.generateId(),
        name: "Formal Trousers - Black",
        barcode: "MF001234567892",
        price: 2199,
        quantity: 20,
        soldQuantity: 8,
        category: "pants",
        image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: this.generateId(),
        name: "Casual Jeans - Dark Blue",
        barcode: "MF001234567893",
        price: 1799,
        quantity: 30,
        soldQuantity: 12,
        category: "pants",
        image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&h=400&fit=crop",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: this.generateId(),
        name: "Elegant Saree - Red",
        barcode: "MF001234567894",
        price: 3499,
        quantity: 10,
        soldQuantity: 2,
        category: "dresses",
        image: "https://images.unsplash.com/photo-1610030469983-98e550d581b8?w=400&h=400&fit=crop",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: this.generateId(),
        name: "Party Dress - Pink",
        barcode: "MF001234567895",
        price: 2799,
        quantity: 12,
        soldQuantity: 4,
        category: "dresses",
        image: "https://images.unsplash.com/photo-1595777457583-95e059d53772?w=400&h=400&fit=crop",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: this.generateId(),
        name: "Leather Shoes - Brown",
        barcode: "MF001234567896",
        price: 3299,
        quantity: 18,
        soldQuantity: 6,
        category: "shoes",
        image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: this.generateId(),
        name: "Sports Sneakers - White",
        barcode: "MF001234567897",
        price: 2499,
        quantity: 22,
        soldQuantity: 9,
        category: "shoes",
        image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&h=400&fit=crop",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: this.generateId(),
        name: "Gold Chain Necklace",
        barcode: "MF001234567898",
        price: 4999,
        quantity: 8,
        soldQuantity: 1,
        category: "accessories",
        image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: this.generateId(),
        name: "Designer Handbag - Black",
        barcode: "MF001234567899",
        price: 2299,
        quantity: 14,
        soldQuantity: 7,
        category: "accessories",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]

    this.products = demoProducts
    this.saveData()
    console.log(`✅ Loaded ${demoProducts.length} demo products`)
  }

  // Public API methods
  async getProducts(): Promise<any[]> {
    await this.initialize()
    console.log(`📦 RETURNING ${this.products.length} PRODUCTS`)
    return [...this.products] // Return copy to prevent mutations
  }

  async createProduct(productData: any): Promise<any> {
    await this.initialize()

    const newProduct = {
      ...productData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    console.log("➕ CREATING PRODUCT:", newProduct.name)
    this.products.unshift(newProduct) // Add to beginning
    this.saveData()

    console.log(`✅ PRODUCT CREATED: ${newProduct.name} (Total: ${this.products.length})`)
    return newProduct
  }

  async updateProduct(id: string, updates: any): Promise<any> {
    await this.initialize()

    const index = this.products.findIndex((p) => p.id === id)
    if (index === -1) {
      throw new Error(`Product with ID ${id} not found`)
    }

    const updatedProduct = {
      ...this.products[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    this.products[index] = updatedProduct
    this.saveData()

    console.log(`✅ PRODUCT UPDATED: ${updatedProduct.name}`)
    return updatedProduct
  }

  async deleteProduct(id: string): Promise<void> {
    await this.initialize()

    const initialLength = this.products.length
    this.products = this.products.filter((p) => p.id !== id)

    if (this.products.length === initialLength) {
      throw new Error(`Product with ID ${id} not found`)
    }

    this.saveData()
    console.log(`✅ PRODUCT DELETED (Remaining: ${this.products.length})`)
  }

  async getProductByBarcode(barcode: string): Promise<any | null> {
    await this.initialize()
    const product = this.products.find((p) => p.barcode === barcode)
    console.log(`🔍 BARCODE SEARCH ${barcode}:`, product ? "FOUND" : "NOT FOUND")
    return product || null
  }

  async getBills(): Promise<any[]> {
    await this.initialize()
    return [...this.bills]
  }

  async createBill(billData: any): Promise<any> {
    await this.initialize()

    const newBill = {
      ...billData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    }

    this.bills.unshift(newBill)
    this.saveData()

    console.log(`✅ BILL CREATED: ${newBill.id}`)
    return newBill
  }

  generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  generateBarcode(): string {
    return `MF${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`
  }

  clearAllData(): void {
    console.log("🗑️ CLEARING ALL DATA...")
    this.products = []
    this.bills = []
    this.saveData()

    // Also clear from storage
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("moraya_products")
        localStorage.removeItem("moraya_bills")
        sessionStorage.removeItem("moraya_products")
        sessionStorage.removeItem("moraya_bills")
      }
    } catch (error) {
      console.warn("⚠️ Failed to clear storage:", error)
    }
  }

  reloadDemoProducts(): void {
    console.log("🔄 RELOADING DEMO PRODUCTS...")
    this.products = []
    this.loadDemoProducts()
  }

  getDebugInfo(): any {
    return {
      isInitialized: this.isInitialized,
      productsCount: this.products.length,
      billsCount: this.bills.length,
      storageTest: this.testStorage(),
      sampleProducts: this.products.slice(0, 3).map((p) => ({ id: p.id, name: p.name, barcode: p.barcode })),
    }
  }
}
