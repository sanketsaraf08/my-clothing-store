import { createClient } from "@supabase/supabase-js"
import type { Product, Bill } from "@/lib/types"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export class SupabaseService {
  // Products
  static async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false })

    if (error) throw new Error(`Supabase error: ${error.message}`)
    return data || []
  }

  static async createProduct(product: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product> {
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

    if (error) throw new Error(`Supabase error: ${error.message}`)
    return this.mapSupabaseProduct(data)
  }

  static async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
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

    if (error) throw new Error(`Supabase error: ${error.message}`)
    return this.mapSupabaseProduct(data)
  }

  static async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase.from("products").delete().eq("id", id)

    if (error) throw new Error(`Supabase error: ${error.message}`)
  }

  static async getProductByBarcode(barcode: string): Promise<Product | null> {
    const { data, error } = await supabase.from("products").select("*").eq("barcode", barcode).single()

    if (error && error.code !== "PGRST116") {
      throw new Error(`Supabase error: ${error.message}`)
    }

    return data ? this.mapSupabaseProduct(data) : null
  }

  // Bills
  static async createBill(bill: Omit<Bill, "id" | "createdAt">): Promise<Bill> {
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

    if (error) throw new Error(`Supabase error: ${error.message}`)
    return this.mapSupabaseBill(data)
  }

  static async getBills(): Promise<Bill[]> {
    const { data, error } = await supabase.from("bills").select("*").order("created_at", { ascending: false })

    if (error) throw new Error(`Supabase error: ${error.message}`)
    return data?.map(this.mapSupabaseBill) || []
  }

  // Helper methods to map database fields to our types
  private static mapSupabaseProduct(data: any): Product {
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

  private static mapSupabaseBill(data: any): Bill {
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
}
