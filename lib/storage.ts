import type { CartItem } from "./types"

export class StorageService {
  private static CART_KEY = "clothing_store_cart"
  private static BARCODE_COUNTER_KEY = "barcode_counter"

  /**
   * Get items in cart (client-side only)
   */
  static getCart(): CartItem[] {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(this.CART_KEY)
    return data ? JSON.parse(data) : []
  }

  /**
   * Save cart items (client-side only)
   */
  static saveCart(cart: CartItem[]): void {
    if (typeof window === "undefined") return
    localStorage.setItem(this.CART_KEY, JSON.stringify(cart))
  }

  /**
   * Generate a unique barcode number using a local counter
   * Only used for local creation, Supabase will store the value
   */
  static generateBarcode(): string {
    if (typeof window === "undefined") return "1000000001"

    const counter = localStorage.getItem(this.BARCODE_COUNTER_KEY)
    let currentNumber = counter ? Number.parseInt(counter) : 1000000000

    currentNumber += 1
    localStorage.setItem(this.BARCODE_COUNTER_KEY, currentNumber.toString())

    return currentNumber.toString()
  }

  /**
   * 🔒 These methods are deprecated (handled by Supabase)
   */
  static getBills(): never {
    throw new Error("❌ StorageService.getBills() is removed. Use db.getBills() instead.")
  }

  static saveBills(): never {
    throw new Error("❌ StorageService.saveBills() is removed. Use db.createBill() instead.")
  }

  static getProducts(): never {
    throw new Error("❌ StorageService.getProducts() is removed. Use db.getProducts() instead.")
  }

  static saveProducts(): never {
    throw new Error("❌ StorageService.saveProducts() is removed. Use db.createProduct() instead.")
  }

  static updateProductStock(): never {
    throw new Error("❌ updateProductStock is removed. Use db.updateProduct() after a bill.")
  }

  static getStockSummary(): never {
    throw new Error("❌ getStockSummary is removed. Calculate from db.getProducts() results.")
  }
}
