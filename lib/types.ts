export interface Product {
  id: string
  name: string
  barcode: string
  price: number
  quantity: number // current stock
  soldQuantity: number // sold stock
  category: string
  image?: string
  createdAt: Date
  updatedAt: Date
}

export interface CartItem {
  product: Product
  quantity: number
  customPrice?: number
}

export interface Bill {
  id: string
  items: CartItem[]
  subtotal: number
  discount: number
  total: number
  upiId: string
  createdAt: Date
  qrCode: string
}

export interface StockSummary {
  totalProducts: number
  totalCurrentStock: number
  totalSoldStock: number
  totalStockValue: number
  totalSoldValue: number
}

export type Category = "shirts" | "pants" | "dresses" | "shoes" | "accessories"
