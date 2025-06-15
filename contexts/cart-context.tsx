"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"
import type { CartItem, Product } from "@/lib/types"
import { StorageService } from "@/lib/storage"

interface CartState {
  items: CartItem[]
  total: number
}

type CartAction =
  | { type: "ADD_ITEM"; payload: Product }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { productId: string; quantity: number } }
  | { type: "UPDATE_PRICE"; payload: { productId: string; price: number } }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: CartItem[] }
  | { type: "CHECKOUT_COMPLETE"; payload: CartItem[] }

const CartContext = createContext<{
  state: CartState
  dispatch: React.Dispatch<CartAction>
} | null>(null)

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "LOAD_CART":
      const loadedTotal = action.payload.reduce(
        (sum, item) => sum + (item.customPrice || item.product.price) * item.quantity,
        0,
      )
      return { items: action.payload, total: loadedTotal }

    case "ADD_ITEM":
      const existingItem = state.items.find((item) => item.product.id === action.payload.id)
      let newItems: CartItem[]

      if (existingItem) {
        newItems = state.items.map((item) =>
          item.product.id === action.payload.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      } else {
        newItems = [...state.items, { product: action.payload, quantity: 1 }]
      }

      const addTotal = newItems.reduce((sum, item) => sum + (item.customPrice || item.product.price) * item.quantity, 0)

      return { items: newItems, total: addTotal }

    case "REMOVE_ITEM":
      const filteredItems = state.items.filter((item) => item.product.id !== action.payload)
      const removeTotal = filteredItems.reduce(
        (sum, item) => sum + (item.customPrice || item.product.price) * item.quantity,
        0,
      )

      return { items: filteredItems, total: removeTotal }

    case "UPDATE_QUANTITY":
      const quantityItems = state.items
        .map((item) =>
          item.product.id === action.payload.productId
            ? { ...item, quantity: Math.max(0, action.payload.quantity) }
            : item,
        )
        .filter((item) => item.quantity > 0)

      const quantityTotal = quantityItems.reduce(
        (sum, item) => sum + (item.customPrice || item.product.price) * item.quantity,
        0,
      )

      return { items: quantityItems, total: quantityTotal }

    case "UPDATE_PRICE":
      const priceItems = state.items.map((item) =>
        item.product.id === action.payload.productId ? { ...item, customPrice: action.payload.price } : item,
      )

      const priceTotal = priceItems.reduce(
        (sum, item) => sum + (item.customPrice || item.product.price) * item.quantity,
        0,
      )

      return { items: priceItems, total: priceTotal }

    case "CLEAR_CART":
      return { items: [], total: 0 }

    case "CHECKOUT_COMPLETE":
      // Update stock quantities in storage
      action.payload.forEach((item) => {
        StorageService.updateProductStock(item.product.id, item.quantity)
      })
      return { items: [], total: 0 }

    default:
      return state
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0 })

  useEffect(() => {
    const savedCart = StorageService.getCart()
    dispatch({ type: "LOAD_CART", payload: savedCart })
  }, [])

  useEffect(() => {
    StorageService.saveCart(state.items)
  }, [state.items])

  return <CartContext.Provider value={{ state, dispatch }}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
