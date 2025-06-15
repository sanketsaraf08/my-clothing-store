export interface Product {
  id: string
  name: string
  barcode: string
  price: number
  quantity: number
  soldQuantity: number
  category: string
  image?: string
  createdAt: Date
  updatedAt: Date
}

export interface CartItem {
  id: string
  productId: string
  name: string
  barcode: string
  price: number
  originalPrice: number
  quantity: number
  image?: string
}

export interface Bill {
  id: string
  items: CartItem[]
  total: number
  customerPhone?: string
  qrCode: string
  createdAt: Date
}

export interface Customer {
  id: string
  phone: string
  name?: string
  email?: string
  totalPurchases: number
  lastPurchase: Date
  createdAt: Date
}

export type Category = "shirts" | "pants" | "dresses" | "shoes" | "accessories"
