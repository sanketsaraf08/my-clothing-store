import { neon } from "@neondatabase/serverless"
import type { Product, Bill } from "@/lib/types"

const sql = neon(process.env.DATABASE_URL!)

export class NeonService {
  // Products
  static async getProducts(): Promise<Product[]> {
    const result = await sql`
      SELECT * FROM products 
      ORDER BY created_at DESC
    `

    return result.map(this.mapNeonProduct)
  }

  static async createProduct(product: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product> {
    const result = await sql`
      INSERT INTO products (
        name, barcode, price, quantity, sold_quantity, category, image
      ) VALUES (
        ${product.name}, ${product.barcode}, ${product.price}, 
        ${product.quantity}, ${product.soldQuantity}, ${product.category}, ${product.image}
      )
      RETURNING *
    `

    return this.mapNeonProduct(result[0])
  }

  static async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const result = await sql`
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

    return this.mapNeonProduct(result[0])
  }

  static async deleteProduct(id: string): Promise<void> {
    await sql`DELETE FROM products WHERE id = ${id}`
  }

  static async getProductByBarcode(barcode: string): Promise<Product | null> {
    const result = await sql`
      SELECT * FROM products WHERE barcode = ${barcode} LIMIT 1
    `

    return result.length > 0 ? this.mapNeonProduct(result[0]) : null
  }

  // Bills
  static async createBill(bill: Omit<Bill, "id" | "createdAt">): Promise<Bill> {
    const result = await sql`
      INSERT INTO bills (items, total, customer_phone, qr_code)
      VALUES (${JSON.stringify(bill.items)}, ${bill.total}, ${bill.customerPhone}, ${bill.qrCode})
      RETURNING *
    `

    return this.mapNeonBill(result[0])
  }

  static async getBills(): Promise<Bill[]> {
    const result = await sql`
      SELECT * FROM bills ORDER BY created_at DESC
    `

    return result.map(this.mapNeonBill)
  }

  // Helper methods
  private static mapNeonProduct(data: any): Product {
    return {
      id: data.id,
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
      id: data.id,
      items: JSON.parse(data.items),
      total: Number(data.total),
      customerPhone: data.customer_phone,
      qrCode: data.qr_code,
      createdAt: new Date(data.created_at),
    }
  }
}
