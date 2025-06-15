import { createClient } from "@supabase/supabase-js"
import type { Product, Bill } from "@/lib/types"

// Supabase client configuration
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export class DatabaseService {
  // Products
  static async getProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Supabase error:", error)
        throw new Error(`Failed to fetch products: ${error.message}`)
      }

      return data?.map(this.mapProduct) || []
    } catch (error) {
      console.error("Database error:", error)
      throw error
    }
  }

  static async createProduct(product: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product> {
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
        console.error("Supabase error:", error)
        throw new Error(`Failed to create product: ${error.message}`)
      }

      return this.mapProduct(data)
    } catch (error) {
      console.error("Database error:", error)
      throw error
    }
  }

  static async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
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
        console.error("Supabase error:", error)
        throw new Error(`Failed to update product: ${error.message}`)
      }

      return this.mapProduct(data)
    } catch (error) {
      console.error("Database error:", error)
      throw error
    }
  }

  static async deleteProduct(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("products").delete().eq("id", id)

      if (error) {
        console.error("Supabase error:", error)
        throw new Error(`Failed to delete product: ${error.message}`)
      }
    } catch (error) {
      console.error("Database error:", error)
      throw error
    }
  }

  static async getProductByBarcode(barcode: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase.from("products").select("*").eq("barcode", barcode).single()

      if (error && error.code !== "PGRST116") {
        console.error("Supabase error:", error)
        throw new Error(`Failed to fetch product: ${error.message}`)
      }

      return data ? this.mapProduct(data) : null
    } catch (error) {
      console.error("Database error:", error)
      return null
    }
  }

  // Bills
  static async createBill(bill: Omit<Bill, "id" | "createdAt">): Promise<Bill> {
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
        console.error("Supabase error:", error)
        throw new Error(`Failed to create bill: ${error.message}`)
      }

      return this.mapBill(data)
    } catch (error) {
      console.error("Database error:", error)
      throw error
    }
  }

  static async getBills(): Promise<Bill[]> {
    try {
      const { data, error } = await supabase.from("bills").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Supabase error:", error)
        throw new Error(`Failed to fetch bills: ${error.message}`)
      }

      return data?.map(this.mapBill) || []
    } catch (error) {
      console.error("Database error:", error)
      throw error
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

  // Utility method to generate barcode
  static generateBarcode(): string {
    return `${Date.now()}${Math.random().toString(36).substr(2, 9)}`
  }
}

// Export as default database service
export const db = DatabaseService
