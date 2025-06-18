import type { CartItem } from "./types"

export class StorageService {
  private static CART_KEY = "clothing_store_cart"
  private static BARCODE_COUNTER_KEY = "barcode_counter"

  // CART: Local storage only (temporary data)
  static getCart(): CartItem[] {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(this.CART_KEY)
    return data ? JSON.parse(data) : []
  }

  static saveCart(cart: CartItem[]): void {
    if (typeof window === "undefined") return
    localStorage.setItem(this.CART_KEY, JSON.stringify(cart))
  }

  // BARCODE COUNTER (if you want sequential barcodes locally)
  static generateBarcode(): string {
    if (typeof window === "undefined") return "1000000001"

    const counter = localStorage.getItem(this.BARCODE_COUNTER_KEY)
    let currentNumber = counter ? Number.parseInt(counter) : 1000000000

    currentNumber += 1
    localStorage.setItem(this.BARCODE_COUNTER_KEY, currentNumber.toString())

    return currentNumber.toString()
  }
}
