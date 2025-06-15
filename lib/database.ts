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

// Fallback localStorage service
class LocalStorageService {
  private static PRODUCTS_KEY = "moraya_fashion_products"
  private static BILLS_KEY = "moraya_fashion_bills"

  static getProducts(): Product[] {
    if (typeof window === "undefined") return []
    try {
      const data = localStorage.getItem(this.PRODUCTS_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error("Error reading products from localStorage:", error)
      return []
    }
  }

  static saveProducts(products: Product[]): void {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(this.PRODUCTS_KEY, JSON.stringify(products))
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

  static async createProduct(product: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product> {
    const products = this.getProducts()
    const newProduct: Product = {
      ...product,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    products.push(newProduct)
    this.saveProducts(products)
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
      return data ? JSON.parse(data) : []
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
    bills.push(newBill)
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
    return `${Date.now()}${Math.random().toString(36).substr(2, 9)}`
  }
}

export class DatabaseService {
  // Products
  static async getProducts(): Promise<Product[]> {
    if (!supabase) {
      console.log("Using localStorage fallback for products")
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
      console.log("Using localStorage fallback for product creation")
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
}

// Export as default database service
export const db = DatabaseService
