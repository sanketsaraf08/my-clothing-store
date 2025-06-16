import type { Product, Bill } from "@/lib/types"

export class StorageService {
  private static readonly PRODUCTS_KEY = "moraya_products"
  private static readonly BILLS_KEY = "moraya_bills"

  // Products
  static getProducts(): Product[] {
    try {
      if (typeof window === "undefined") return []

      const stored = localStorage.getItem(this.PRODUCTS_KEY)
      if (!stored) return []

      const products = JSON.parse(stored)
      return products.map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
      }))
    } catch (error) {
      console.error("Error loading products from storage:", error)
      return []
    }
  }

  static saveProducts(products: Product[]): void {
    try {
      if (typeof window === "undefined") return

      localStorage.setItem(this.PRODUCTS_KEY, JSON.stringify(products))

      // Dispatch event for other components
      window.dispatchEvent(
        new CustomEvent("moraya_data_updated", {
          detail: { type: "products", data: products },
        }),
      )
    } catch (error) {
      console.error("Error saving products to storage:", error)
    }
  }

  // Bills
  static getBills(): Bill[] {
    try {
      if (typeof window === "undefined") return []

      const stored = localStorage.getItem(this.BILLS_KEY)
      if (!stored) return []

      const bills = JSON.parse(stored)
      return bills.map((b: any) => ({
        ...b,
        createdAt: new Date(b.createdAt),
      }))
    } catch (error) {
      console.error("Error loading bills from storage:", error)
      return []
    }
  }

  static saveBills(bills: Bill[]): void {
    try {
      if (typeof window === "undefined") return

      localStorage.setItem(this.BILLS_KEY, JSON.stringify(bills))

      // Dispatch event for other components
      window.dispatchEvent(
        new CustomEvent("moraya_data_updated", {
          detail: { type: "bills", data: bills },
        }),
      )
    } catch (error) {
      console.error("Error saving bills to storage:", error)
    }
  }

  // Initialize with demo data if empty
  static initializeDemoData(): void {
    const existingProducts = this.getProducts()
    if (existingProducts.length === 0) {
      console.log("🎯 Initializing demo products...")

      const demoProducts: Product[] = [
        {
          id: "demo_1",
          name: "Premium Cotton Shirt",
          barcode: "1000000001",
          price: 899,
          quantity: 25,
          soldQuantity: 5,
          category: "shirts",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "demo_2",
          name: "Designer Jeans",
          barcode: "1000000002",
          price: 1299,
          quantity: 15,
          soldQuantity: 8,
          category: "pants",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "demo_3",
          name: "Elegant Dress",
          barcode: "1000000003",
          price: 1599,
          quantity: 12,
          soldQuantity: 3,
          category: "dresses",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "demo_4",
          name: "Casual Sneakers",
          barcode: "1000000004",
          price: 2199,
          quantity: 20,
          soldQuantity: 7,
          category: "shoes",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "demo_5",
          name: "Leather Handbag",
          barcode: "1000000005",
          price: 2499,
          quantity: 8,
          soldQuantity: 2,
          category: "accessories",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      this.saveProducts(demoProducts)
      console.log("✅ Demo products initialized:", demoProducts.length)
    }
  }

  // Clear all data
  static clearAll(): void {
    try {
      if (typeof window === "undefined") return

      localStorage.removeItem(this.PRODUCTS_KEY)
      localStorage.removeItem(this.BILLS_KEY)

      console.log("🗑️ All data cleared")
    } catch (error) {
      console.error("Error clearing storage:", error)
    }
  }
}
