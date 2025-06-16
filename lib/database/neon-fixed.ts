import { neon } from "@neondatabase/serverless"
import type { Product, Bill } from "@/lib/types"

// Enhanced Neon service with better error handling
export class NeonServiceFixed {
  private static sql: any = null
  private static isInitialized = false
  private static connectionError: string | null = null

  // Initialize connection with proper error handling
  static async initialize(): Promise<boolean> {
    try {
      console.log("🔌 NEON: Initializing connection...")

      // Check if DATABASE_URL exists
      if (!process.env.DATABASE_URL) {
        this.connectionError = "DATABASE_URL environment variable is missing"
        console.error("❌ NEON: DATABASE_URL not found")
        return false
      }

      // Validate connection string format
      if (!process.env.DATABASE_URL.startsWith("postgresql://")) {
        this.connectionError = "DATABASE_URL must be a valid PostgreSQL connection string"
        console.error("❌ NEON: Invalid connection string format")
        return false
      }

      // Create connection
      this.sql = neon(process.env.DATABASE_URL)

      // Test connection with a simple query
      console.log("🧪 NEON: Testing connection...")
      await this.sql`SELECT 1 as test`

      this.isInitialized = true
      this.connectionError = null
      console.log("✅ NEON: Connection successful!")
      return true
    } catch (error) {
      this.connectionError = error instanceof Error ? error.message : "Unknown connection error"
      console.error("❌ NEON: Connection failed:", this.connectionError)
      return false
    }
  }

  // Check if service is ready
  static isReady(): boolean {
    return this.isInitialized && this.sql !== null
  }

  // Get connection status
  static getStatus(): { connected: boolean; error: string | null } {
    return {
      connected: this.isInitialized,
      error: this.connectionError,
    }
  }

  // Products with error handling
  static async getProducts(): Promise<Product[]> {
    if (!this.isReady()) {
      throw new Error(`Neon not ready: ${this.connectionError}`)
    }

    try {
      const result = await this.sql`
        SELECT * FROM products 
        ORDER BY created_at DESC
      `
      return result.map(this.mapNeonProduct)
    } catch (error) {
      console.error("❌ NEON: Error fetching products:", error)
      throw new Error(`Failed to fetch products: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  static async createProduct(product: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product> {
    if (!this.isReady()) {
      throw new Error(`Neon not ready: ${this.connectionError}`)
    }

    try {
      const result = await this.sql`
        INSERT INTO products (
          name, barcode, price, quantity, sold_quantity, category, image
        ) VALUES (
          ${product.name}, ${product.barcode}, ${product.price}, 
          ${product.quantity}, ${product.soldQuantity}, ${product.category}, ${product.image}
        )
        RETURNING *
      `

      if (result.length === 0) {
        throw new Error("No product returned after creation")
      }

      return this.mapNeonProduct(result[0])
    } catch (error) {
      console.error("❌ NEON: Error creating product:", error)
      throw new Error(`Failed to create product: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  static async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    if (!this.isReady()) {
      throw new Error(`Neon not ready: ${this.connectionError}`)
    }

    try {
      const result = await this.sql`
        UPDATE products 
        SET 
          name = COALESCE(${updates.name}, name),
          barcode = COALESCE(${updates.barcode}, barcode),
          price = COALESCE(${updates.price}, price),
          quantity = COALESCE(${updates.quantity}, quantity),
          sold_quantity = COALESCE(${updates.soldQuantity}, sold_quantity),
          category = COALESCE(${updates.category}, category),
          image = COALESCE(${updates.image}, image),
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `

      if (result.length === 0) {
        throw new Error(`Product with id ${id} not found`)
      }

      return this.mapNeonProduct(result[0])
    } catch (error) {
      console.error("❌ NEON: Error updating product:", error)
      throw new Error(`Failed to update product: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  static async deleteProduct(id: string): Promise<void> {
    if (!this.isReady()) {
      throw new Error(`Neon not ready: ${this.connectionError}`)
    }

    try {
      const result = await this.sql`DELETE FROM products WHERE id = ${id} RETURNING id`

      if (result.length === 0) {
        throw new Error(`Product with id ${id} not found`)
      }
    } catch (error) {
      console.error("❌ NEON: Error deleting product:", error)
      throw new Error(`Failed to delete product: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  static async getProductByBarcode(barcode: string): Promise<Product | null> {
    if (!this.isReady()) {
      throw new Error(`Neon not ready: ${this.connectionError}`)
    }

    try {
      const result = await this.sql`
        SELECT * FROM products WHERE barcode = ${barcode} LIMIT 1
      `

      return result.length > 0 ? this.mapNeonProduct(result[0]) : null
    } catch (error) {
      console.error("❌ NEON: Error finding product by barcode:", error)
      throw new Error(`Failed to find product: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  // Bills
  static async createBill(bill: Omit<Bill, "id" | "createdAt">): Promise<Bill> {
    if (!this.isReady()) {
      throw new Error(`Neon not ready: ${this.connectionError}`)
    }

    try {
      const result = await this.sql`
        INSERT INTO bills (items, total, customer_phone, qr_code)
        VALUES (${JSON.stringify(bill.items)}, ${bill.total}, ${bill.customerPhone}, ${bill.qrCode})
        RETURNING *
      `

      return this.mapNeonBill(result[0])
    } catch (error) {
      console.error("❌ NEON: Error creating bill:", error)
      throw new Error(`Failed to create bill: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  static async getBills(): Promise<Bill[]> {
    if (!this.isReady()) {
      throw new Error(`Neon not ready: ${this.connectionError}`)
    }

    try {
      const result = await this.sql`
        SELECT * FROM bills ORDER BY created_at DESC
      `

      return result.map(this.mapNeonBill)
    } catch (error) {
      console.error("❌ NEON: Error fetching bills:", error)
      throw new Error(`Failed to fetch bills: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  // Helper methods
  private static mapNeonProduct(data: any): Product {
    return {
      id: data.id.toString(),
      name: data.name,
      barcode: data.barcode,
      price: Number(data.price),
      quantity: Number(data.quantity),
      soldQuantity: Number(data.sold_quantity),
      category: data.category,
      image: data.image,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    }
  }

  private static mapNeonBill(data: any): Bill {
    return {
      id: data.id.toString(),
      items: JSON.parse(data.items),
      total: Number(data.total),
      customerPhone: data.customer_phone,
      qrCode: data.qr_code,
      createdAt: new Date(data.created_at),
    }
  }
}
