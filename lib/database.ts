import { createClient } from "@supabase/supabase-js"
import type { Product, Bill } from "@/lib/types"

// Check if we're in browser environment and have Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Fallback to localStorage if Supabase is not configured
const hasSupabase = supabaseUrl && supabaseKey

let supabase: any = null
if (hasSupabase) {
  try {
    supabase = createClient(supabaseUrl!, supabaseKey!)
  } catch (error) {
    console.warn("Failed to initialize Supabase client:", error)
  }
}

// Demo products for Moraya Fashion
const DEMO_PRODUCTS: Omit<Product, "id" | "createdAt" | "updatedAt">[] = [
  {
    name: "Premium Cotton Shirt - Blue",
    barcode: "MF001234567890",
    price: 1299,
    quantity: 25,
    soldQuantity: 5,
    category: "shirts",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop",
  },
  {
    name: "Designer Kurta - White",
    barcode: "MF001234567891",
    price: 1899,
    quantity: 15,
    soldQuantity: 3,
    category: "shirts",
    image: "https://images.unsplash.com/photo-1583743814966-8936f37f8302?w=400&h=400&fit=crop",
  },
  {
    name: "Formal Trousers - Black",
    barcode: "MF001234567892",
    price: 2199,
    quantity: 20,
    soldQuantity: 8,
    category: "pants",
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop",
  },
  {
    name: "Casual Jeans - Dark Blue",
    barcode: "MF001234567893",
    price: 1799,
    quantity: 30,
    soldQuantity: 12,
    category: "pants",
    image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&h=400&fit=crop",
  },
  {
    name: "Elegant Saree - Red",
    barcode: "MF001234567894",
    price: 3499,
    quantity: 10,
    soldQuantity: 2,
    category: "dresses",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d581b8?w=400&h=400&fit=crop",
  },
  {
    name: "Party Dress - Pink",
    barcode: "MF001234567895",
    price: 2799,
    quantity: 12,
    soldQuantity: 4,
    category: "dresses",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d53772?w=400&h=400&fit=crop",
  },
  {
    name: "Leather Shoes - Brown",
    barcode: "MF001234567896",
    price: 3299,
    quantity: 18,
    soldQuantity: 6,
    category: "shoes",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop",
  },
  {
    name: "Sports Sneakers - White",
    barcode: "MF001234567897",
    price: 2499,
    quantity: 22,
    soldQuantity: 9,
    category: "shoes",
    image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&h=400&fit=crop",
  },
  {
    name: "Gold Chain Necklace",
    barcode: "MF001234567898",
    price: 4999,
    quantity: 8,
    soldQuantity: 1,
    category: "accessories",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop",
  },
  {
    name: "Designer Handbag - Black",
    barcode: "MF001234567899",
    price: 2299,
    quantity: 14,
    soldQuantity: 7,
    category: "accessories",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
  },
]

// Fallback localStorage service
class LocalStorageService {
  private static PRODUCTS_KEY = "moraya_fashion_products"
  private static BILLS_KEY = "moraya_fashion_bills"
  private static DEMO_LOADED_KEY = "moraya_fashion_demo_loaded"

  static getProducts(): Product[] {
    if (typeof window === "undefined") return []
    try {
      // Check if demo products need to be loaded
      const demoLoaded = localStorage.getItem(this.DEMO_LOADED_KEY)
      if (!demoLoaded) {
        this.loadDemoProducts()
      }

      const data = localStorage.getItem(this.PRODUCTS_KEY)
      const products = data ? JSON.parse(data) : []

      // Ensure dates are properly converted
      return products.map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
      }))
    } catch (error) {
      console.error("Error reading products from localStorage:", error)
      return []
    }
  }

  static saveProducts(products: Product[]): void {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(this.PRODUCTS_KEY, JSON.stringify(products))
      console.log(`Saved ${products.length} products to localStorage`)

      // Trigger storage event for cross-tab sync
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: this.PRODUCTS_KEY,
          newValue: JSON.stringify(products),
        }),
      )
    } catch (error) {
      console.error("Error saving products to localStorage:", error)
    }
  }

  static loadDemoProducts(): void {
    if (typeof window === "undefined") return

    try {
      const existingProducts = this.getProducts()
      if (existingProducts.length > 0) {
        // Products already exist, don't load demo
        localStorage.setItem(this.DEMO_LOADED_KEY, "true")
        return
      }

      console.log("Loading demo products for Moraya Fashion...")
      const demoProducts: Product[] = DEMO_PRODUCTS.map((product, index) => ({
        ...product,
        id: this.generateId(),
        createdAt: new Date(Date.now() - (DEMO_PRODUCTS.length - index) * 60000), // Stagger creation times
        updatedAt: new Date(Date.now() - (DEMO_PRODUCTS.length - index) * 60000),
      }))

      this.saveProducts(demoProducts)
      localStorage.setItem(this.DEMO_LOADED_KEY, "true")
      console.log(`Loaded ${demoProducts.length} demo products`)
    } catch (error) {
      console.error("Error loading demo products:", error)
    }
  }

  static async createProduct(product: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product> {
    const products = this.getProducts()
    const newProduct: Product = {
      ...product,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    products.unshift(newProduct) // Add to beginning for newest first
    this.saveProducts(products)
    console.log("Created new product:", newProduct.name, "ID:", newProduct.id)
    return newProduct
  }

  static async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const products = this.getProducts()
    const index = products.findIndex((p) => p.id === id)
    if (index === -1) throw new Error("Product not found")

    const updatedProduct = {
      ...products[index],
      ...updates,
      updatedAt: new Date(),
    }
    products[index] = updatedProduct
    this.saveProducts(products)
    return updatedProduct
  }

  static async deleteProduct(id: string): Promise<void> {
    const products = this.getProducts()
    const filtered = products.filter((p) => p.id !== id)
    this.saveProducts(filtered)
  }

  static async getProductByBarcode(barcode: string): Promise<Product | null> {
    const products = this.getProducts()
    return products.find((p) => p.barcode === barcode) || null
  }

  static getBills(): Bill[] {
    if (typeof window === "undefined") return []
    try {
      const data = localStorage.getItem(this.BILLS_KEY)
      const bills = data ? JSON.parse(data) : []
      return bills.map((b: any) => ({
        ...b,
        createdAt: new Date(b.createdAt),
      }))
    } catch (error) {
      console.error("Error reading bills from localStorage:", error)
      return []
    }
  }

  static async createBill(bill: Omit<Bill, "id" | "createdAt">): Promise<Bill> {
    const bills = this.getBills()
    const newBill: Bill = {
      ...bill,
      id: this.generateId(),
      createdAt: new Date(),
    }
    bills.unshift(newBill) // Add to beginning
    try {
      localStorage.setItem(this.BILLS_KEY, JSON.stringify(bills))
    } catch (error) {
      console.error("Error saving bill to localStorage:", error)
    }
    return newBill
  }

  static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  static generateBarcode(): string {
    return `MF${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`
  }

  static clearAllData(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(this.PRODUCTS_KEY)
    localStorage.removeItem(this.BILLS_KEY)
    localStorage.removeItem(this.DEMO_LOADED_KEY)
    console.log("Cleared all data from localStorage")
  }

  static reloadDemoProducts(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(this.DEMO_LOADED_KEY)
    this.loadDemoProducts()
  }
}

export class DatabaseService {
  // Initialize demo products on first load
  static async initialize(): Promise<void> {
    if (typeof window !== "undefined") {
      LocalStorageService.loadDemoProducts()
    }
  }

  // Products
  static async getProducts(): Promise<Product[]> {
    if (!supabase) {
      console.log("Using localStorage for products")
      return LocalStorageService.getProducts()
    }

    try {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Supabase error, falling back to localStorage:", error)
        return LocalStorageService.getProducts()
      }

      return data?.map(this.mapProduct) || []
    } catch (error) {
      console.error("Database error, falling back to localStorage:", error)
      return LocalStorageService.getProducts()
    }
  }

  static async createProduct(product: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product> {
    if (!supabase) {
      console.log("Using localStorage for product creation")
      return LocalStorageService.createProduct(product)
    }

    try {
      const { data, error } = await supabase
        .from("products")
        .insert([
          {
            name: product.name,
            barcode: product.barcode,
            price: product.price,
            quantity: product.quantity,
            sold_quantity: product.soldQuantity || 0,
            category: product.category,
            image: product.image,
          },
        ])
        .select()
        .single()

      if (error) {
        console.error("Supabase error, falling back to localStorage:", error)
        return LocalStorageService.createProduct(product)
      }

      return this.mapProduct(data)
    } catch (error) {
      console.error("Database error, falling back to localStorage:", error)
      return LocalStorageService.createProduct(product)
    }
  }

  static async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    if (!supabase) {
      return LocalStorageService.updateProduct(id, updates)
    }

    try {
      const { data, error } = await supabase
        .from("products")
        .update({
          name: updates.name,
          barcode: updates.barcode,
          price: updates.price,
          quantity: updates.quantity,
          sold_quantity: updates.soldQuantity,
          category: updates.category,
          image: updates.image,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        console.error("Supabase error, falling back to localStorage:", error)
        return LocalStorageService.updateProduct(id, updates)
      }

      return this.mapProduct(data)
    } catch (error) {
      console.error("Database error, falling back to localStorage:", error)
      return LocalStorageService.updateProduct(id, updates)
    }
  }

  static async deleteProduct(id: string): Promise<void> {
    if (!supabase) {
      return LocalStorageService.deleteProduct(id)
    }

    try {
      const { error } = await supabase.from("products").delete().eq("id", id)

      if (error) {
        console.error("Supabase error, falling back to localStorage:", error)
        return LocalStorageService.deleteProduct(id)
      }
    } catch (error) {
      console.error("Database error, falling back to localStorage:", error)
      return LocalStorageService.deleteProduct(id)
    }
  }

  static async getProductByBarcode(barcode: string): Promise<Product | null> {
    if (!supabase) {
      return LocalStorageService.getProductByBarcode(barcode)
    }

    try {
      const { data, error } = await supabase.from("products").select("*").eq("barcode", barcode).single()

      if (error && error.code !== "PGRST116") {
        console.error("Supabase error, falling back to localStorage:", error)
        return LocalStorageService.getProductByBarcode(barcode)
      }

      return data ? this.mapProduct(data) : null
    } catch (error) {
      console.error("Database error, falling back to localStorage:", error)
      return LocalStorageService.getProductByBarcode(barcode)
    }
  }

  // Bills
  static async createBill(bill: Omit<Bill, "id" | "createdAt">): Promise<Bill> {
    if (!supabase) {
      return LocalStorageService.createBill(bill)
    }

    try {
      const { data, error } = await supabase
        .from("bills")
        .insert([
          {
            items: bill.items,
            total: bill.total,
            customer_phone: bill.customerPhone,
            qr_code: bill.qrCode,
          },
        ])
        .select()
        .single()

      if (error) {
        console.error("Supabase error, falling back to localStorage:", error)
        return LocalStorageService.createBill(bill)
      }

      return this.mapBill(data)
    } catch (error) {
      console.error("Database error, falling back to localStorage:", error)
      return LocalStorageService.createBill(bill)
    }
  }

  static async getBills(): Promise<Bill[]> {
    if (!supabase) {
      return LocalStorageService.getBills()
    }

    try {
      const { data, error } = await supabase.from("bills").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Supabase error, falling back to localStorage:", error)
        return LocalStorageService.getBills()
      }

      return data?.map(this.mapBill) || []
    } catch (error) {
      console.error("Database error, falling back to localStorage:", error)
      return LocalStorageService.getBills()
    }
  }

  // Helper methods to map database fields to our types
  private static mapProduct(data: any): Product {
    return {
      id: data.id,
      name: data.name,
      barcode: data.barcode,
      price: data.price,
      quantity: data.quantity,
      soldQuantity: data.sold_quantity || 0,
      category: data.category,
      image: data.image,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    }
  }

  private static mapBill(data: any): Bill {
    return {
      id: data.id,
      items: data.items,
      total: data.total,
      customerPhone: data.customer_phone,
      qrCode: data.qr_code,
      createdAt: new Date(data.created_at),
    }
  }

  // Utility methods
  static generateBarcode(): string {
    return LocalStorageService.generateBarcode()
  }

  static generateId(): string {
    return LocalStorageService.generateId()
  }

  // Demo and utility methods
  static clearAllData(): void {
    LocalStorageService.clearAllData()
  }

  static reloadDemoProducts(): void {
    LocalStorageService.reloadDemoProducts()
  }
}

// Export as default database service
export const db = DatabaseService
