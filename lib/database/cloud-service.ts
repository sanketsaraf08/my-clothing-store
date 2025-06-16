import { createClient } from "@supabase/supabase-js"
import type { Product, Bill } from "@/lib/types"

// Create Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export class CloudDatabaseService {
  private static instance: CloudDatabaseService
  private isInitialized = false

  static getInstance(): CloudDatabaseService {
    if (!CloudDatabaseService.instance) {
      CloudDatabaseService.instance = new CloudDatabaseService()
    }
    return CloudDatabaseService.instance
  }

  async initialize(): Promise<boolean> {
    try {
      // Test connection
      const { data, error } = await supabase.from("products").select("count", { count: "exact", head: true })

      if (error) {
        console.warn("Cloud database not available:", error.message)
        return false
      }

      this.isInitialized = true
      console.log("✅ Cloud database connected successfully")
      return true
    } catch (error) {
      console.warn("Cloud database connection failed:", error)
      return false
    }
  }

  // Products
  async getProducts(): Promise<Product[]> {
    if (!this.isInitialized) return []

    try {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false })

      if (error) throw error

      return data?.map(this.mapSupabaseProduct) || []
    } catch (error) {
      console.error("Failed to fetch products from cloud:", error)
      return []
    }
  }

  async createProduct(product: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product | null> {
    if (!this.isInitialized) return null

    try {
      const { data, error } = await supabase
        .from("products")
        .insert([
          {
            name: product.name,
            barcode: product.barcode,
            price: product.price,
            quantity: product.quantity,
            sold_quantity: product.soldQuantity,
            category: product.category,
            image: product.image,
          },
        ])
        .select()
        .single()

      if (error) throw error
      return this.mapSupabaseProduct(data)
    } catch (error) {
      console.error("Failed to create product in cloud:", error)
      return null
    }
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    if (!this.isInitialized) return null

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

      if (error) throw error
      return this.mapSupabaseProduct(data)
    } catch (error) {
      console.error("Failed to update product in cloud:", error)
      return null
    }
  }

  async deleteProduct(id: string): Promise<boolean> {
    if (!this.isInitialized) return false

    try {
      const { error } = await supabase.from("products").delete().eq("id", id)
      if (error) throw error
      return true
    } catch (error) {
      console.error("Failed to delete product from cloud:", error)
      return false
    }
  }

  // Bills
  async createBill(bill: Omit<Bill, "id" | "createdAt">): Promise<Bill | null> {
    if (!this.isInitialized) return null

    try {
      const { data, error } = await supabase
        .from("bills")
        .insert([
          {
            items: bill.items,
            total: bill.total,
            subtotal: bill.subtotal || bill.total,
            discount: bill.discount || 0,
            customer_phone: bill.customerPhone,
            qr_code: bill.qrCode,
            upi_id: bill.upiId,
          },
        ])
        .select()
        .single()

      if (error) throw error
      return this.mapSupabaseBill(data)
    } catch (error) {
      console.error("Failed to create bill in cloud:", error)
      return null
    }
  }

  async getBills(): Promise<Bill[]> {
    if (!this.isInitialized) return []

    try {
      const { data, error } = await supabase.from("bills").select("*").order("created_at", { ascending: false })

      if (error) throw error
      return data?.map(this.mapSupabaseBill) || []
    } catch (error) {
      console.error("Failed to fetch bills from cloud:", error)
      return []
    }
  }

  // Real-time subscriptions
  subscribeToProducts(callback: (products: Product[]) => void): () => void {
    if (!this.isInitialized) return () => {}

    const subscription = supabase
      .channel("products_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, async () => {
        const products = await this.getProducts()
        callback(products)
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }

  subscribeToSales(callback: (bills: Bill[]) => void): () => void {
    if (!this.isInitialized) return () => {}

    const subscription = supabase
      .channel("bills_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "bills" }, async () => {
        const bills = await this.getBills()
        callback(bills)
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }

  // Helper methods
  private mapSupabaseProduct(data: any): Product {
    return {
      id: data.id,
      name: data.name,
      barcode: data.barcode,
      price: data.price,
      quantity: data.quantity,
      soldQuantity: data.sold_quantity,
      category: data.category,
      image: data.image,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    }
  }

  private mapSupabaseBill(data: any): Bill {
    return {
      id: data.id,
      items: data.items,
      total: data.total,
      subtotal: data.subtotal || data.total,
      discount: data.discount || 0,
      customerPhone: data.customer_phone,
      qrCode: data.qr_code,
      upiId: data.upi_id,
      createdAt: new Date(data.created_at),
    }
  }

  isCloudAvailable(): boolean {
    return this.isInitialized
  }
}

export const cloudDb = CloudDatabaseService.getInstance()
