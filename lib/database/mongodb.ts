import { MongoClient, ObjectId } from "mongodb"
import type { Product, Bill } from "@/lib/types"

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MongoDB URI to .env.local")
}

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!(global as any)._mongoClientPromise) {
    client = new MongoClient(process.env.MONGODB_URI)
    ;(global as any)._mongoClientPromise = client.connect()
  }
  clientPromise = (global as any)._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(process.env.MONGODB_URI)
  clientPromise = client.connect()
}

export class MongoDBService {
  private static async getDb() {
    const client = await clientPromise
    return client.db(process.env.MONGODB_DB_NAME || "clothing_store")
  }

  // Products
  static async getProducts(): Promise<Product[]> {
    const db = await this.getDb()
    const products = await db.collection("products").find({}).sort({ createdAt: -1 }).toArray()

    return products.map(this.mapMongoProduct)
  }

  static async createProduct(product: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product> {
    const db = await this.getDb()
    const now = new Date()

    const result = await db.collection("products").insertOne({
      ...product,
      createdAt: now,
      updatedAt: now,
    })

    const created = await db.collection("products").findOne({ _id: result.insertedId })
    return this.mapMongoProduct(created!)
  }

  static async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const db = await this.getDb()

    await db.collection("products").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
    )

    const updated = await db.collection("products").findOne({ _id: new ObjectId(id) })
    return this.mapMongoProduct(updated!)
  }

  static async deleteProduct(id: string): Promise<void> {
    const db = await this.getDb()
    await db.collection("products").deleteOne({ _id: new ObjectId(id) })
  }

  static async getProductByBarcode(barcode: string): Promise<Product | null> {
    const db = await this.getDb()
    const product = await db.collection("products").findOne({ barcode })

    return product ? this.mapMongoProduct(product) : null
  }

  // Bills
  static async createBill(bill: Omit<Bill, "id" | "createdAt">): Promise<Bill> {
    const db = await this.getDb()
    const now = new Date()

    const result = await db.collection("bills").insertOne({
      ...bill,
      createdAt: now,
    })

    const created = await db.collection("bills").findOne({ _id: result.insertedId })
    return this.mapMongoBill(created!)
  }

  static async getBills(): Promise<Bill[]> {
    const db = await this.getDb()
    const bills = await db.collection("bills").find({}).sort({ createdAt: -1 }).toArray()

    return bills.map(this.mapMongoBill)
  }

  // Helper methods
  private static mapMongoProduct(data: any): Product {
    return {
      id: data._id.toString(),
      name: data.name,
      barcode: data.barcode,
      price: data.price,
      quantity: data.quantity,
      soldQuantity: data.soldQuantity,
      category: data.category,
      image: data.image,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    }
  }

  private static mapMongoBill(data: any): Bill {
    return {
      id: data._id.toString(),
      items: data.items,
      total: data.total,
      customerPhone: data.customerPhone,
      qrCode: data.qrCode,
      createdAt: data.createdAt,
    }
  }
}
