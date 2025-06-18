import type { Product, CartItem, Bill } from "./types"

type StockSummary = {
  totalProducts: number
  totalCurrentStock: number
  totalSoldStock: number
  totalStockValue: number
  totalSoldValue: number
}

// Simulated database using localStorage
export class StorageService {
  private static PRODUCTS_KEY = "clothing_store_products"
  private static CART_KEY = "clothing_store_cart"
  private static BILLS_KEY = "clothing_store_bills"
  private static BARCODE_COUNTER_KEY = "barcode_counter"

  static getProducts(): Product[] {
    if (typeof window === "undefined") return []
    try {
      const data = localStorage.getItem(this.PRODUCTS_KEY)
      const products = data ? JSON.parse(data) : this.getDefaultProducts()
      console.log("Storage: Loaded products:", products.length)
      return products
    } catch (error) {
      console.error("Storage: Error loading products:", error)
      return this.getDefaultProducts()
    }
  }

  static saveProducts(products: Product[]): void {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(this.PRODUCTS_KEY, JSON.stringify(products))
      console.log("Storage: Saved products successfully:", products.length)

      // Trigger a storage event to notify other components
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: this.PRODUCTS_KEY,
          newValue: JSON.stringify(products),
        }),
      )
    } catch (error) {
      console.error("Storage: Error saving products:", error)
    }
  }

  static getCart(): CartItem[] {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(this.CART_KEY)
    return data ? JSON.parse(data) : []
  }

  static saveCart(cart: CartItem[]): void {
    if (typeof window === "undefined") return
    localStorage.setItem(this.CART_KEY, JSON.stringify(cart))
  }

  static getBills(): Bill[] {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(this.BILLS_KEY)
    return data ? JSON.parse(data) : []
  }

  static saveBills(bills: Bill[]): void {
    if (typeof window === "undefined") return
    localStorage.setItem(this.BILLS_KEY, JSON.stringify(bills))
  }

  // Generate automatic barcode
  static generateBarcode(): string {
    if (typeof window === "undefined") return "1000000001"

    const counter = localStorage.getItem(this.BARCODE_COUNTER_KEY)
    let currentNumber = counter ? Number.parseInt(counter) : 1000000000

    currentNumber += 1
    localStorage.setItem(this.BARCODE_COUNTER_KEY, currentNumber.toString())

    return currentNumber.toString()
  }

  private static getDefaultProducts(): Product[] {
    const defaultProducts = [
      {
        id: "1",
        name: "Classic White T-Shirt",
        barcode: "1000000001",
        price: 599,
        quantity: 50,
        soldQuantity: 0,
        category: "shirts",
        image: "/placeholder.svg?height=300&width=300&text=White+T-Shirt",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "2",
        name: "Blue Denim Jeans",
        barcode: "1000000002",
        price: 1999,
        quantity: 30,
        soldQuantity: 0,
        category: "pants",
        image: "/placeholder.svg?height=300&width=300&text=Denim+Jeans",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "3",
        name: "Summer Floral Dress",
        barcode: "1000000003",
        price: 1799,
        quantity: 25,
        soldQuantity: 0,
        category: "dresses",
        image: "/placeholder.svg?height=300&width=300&text=Floral+Dress",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "4",
        name: "Leather Sneakers",
        barcode: "1000000004",
        price: 2999,
        quantity: 20,
        soldQuantity: 0,
        category: "shoes",
        image: "/placeholder.svg?height=300&width=300&text=Leather+Sneakers",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "5",
        name: "Cotton Kurta",
        barcode: "1000000005",
        price: 899,
        quantity: 35,
        soldQuantity: 0,
        category: "shirts",
        image: "/placeholder.svg?height=300&width=300&text=Cotton+Kurta",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "6",
        name: "Designer Saree",
        barcode: "1000000006",
        price: 4999,
        quantity: 15,
        soldQuantity: 0,
        category: "dresses",
        image: "/placeholder.svg?height=300&width=300&text=Designer+Saree",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    // Set initial counter
    if (!localStorage.getItem(this.BARCODE_COUNTER_KEY)) {
      localStorage.setItem(this.BARCODE_COUNTER_KEY, "1000000006")
    }

    this.saveProducts(defaultProducts)
    return defaultProducts
  }

  // Add method to update stock after sale
  static updateProductStock(productId: string, soldQuantity: number): void {
    const products = this.getProducts()
    const productIndex = products.findIndex((p) => p.id === productId)

    if (productIndex !== -1) {
      products[productIndex].quantity -= soldQuantity
      products[productIndex].soldQuantity += soldQuantity
      products[productIndex].updatedAt = new Date()
      this.saveProducts(products)
    }
  }

  // Add method to get stock summary
  static getStockSummary(): StockSummary {
    const products = this.getProducts()

    return {
      totalProducts: products.length,
      totalCurrentStock: products.reduce((sum, p) => sum + p.quantity, 0),
      totalSoldStock: products.reduce((sum, p) => sum + p.soldQuantity, 0),
      totalStockValue: products.reduce((sum, p) => sum + p.quantity * p.price, 0),
      totalSoldValue: products.reduce((sum, p) => sum + p.soldQuantity * p.price, 0),
    }
  }
}
