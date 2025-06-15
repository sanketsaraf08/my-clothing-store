"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Minus, Plus, Trash2, ShoppingCart, Receipt, Package, Percent } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { formatCurrency, generateId } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import Navigation from "@/components/navigation"
import { StorageService } from "@/lib/storage"
import type { Bill } from "@/lib/types"

export default function CartPage() {
  const { state, dispatch } = useCart()
  const [isProcessing, setIsProcessing] = useState(false)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [discountType, setDiscountType] = useState<"amount" | "percentage">("amount")

  const updateQuantity = (productId: string, newQuantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { productId, quantity: newQuantity } })
  }

  const updatePrice = (productId: string, newPrice: number) => {
    dispatch({ type: "UPDATE_PRICE", payload: { productId, price: newPrice } })
  }

  const removeItem = (productId: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: productId })
    toast({
      title: "Item Removed",
      description: "Item has been removed from your cart",
    })
  }

  const calculateDiscount = () => {
    if (discountType === "percentage") {
      return (state.total * discountAmount) / 100
    }
    return discountAmount
  }

  const finalTotal = state.total - calculateDiscount()

  const generateBill = async () => {
    if (state.items.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Add items to cart before generating a bill",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      const subtotal = state.total
      const discount = calculateDiscount()
      const total = subtotal - discount

      // Generate QR code data
      const qrData = {
        items: state.items.map((item) => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.customPrice || item.product.price,
          total: (item.customPrice || item.product.price) * item.quantity,
        })),
        subtotal,
        discount,
        total,
        upiId: "9156161100@upi",
        timestamp: new Date().toISOString(),
      }

      // Create bill
      const bill: Bill = {
        id: generateId(),
        items: state.items,
        subtotal,
        discount,
        total,
        upiId: "9156161100@upi",
        createdAt: new Date(),
        qrCode: JSON.stringify(qrData),
      }

      // Save bill
      const bills = StorageService.getBills()
      bills.push(bill)
      StorageService.saveBills(bills)

      // Update stock quantities
      dispatch({ type: "CHECKOUT_COMPLETE", payload: state.items })

      toast({
        title: "Bill Generated",
        description: "Your bill has been generated successfully",
      })

      // Redirect to bills page
      window.location.href = "/bills"
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate bill",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Shopping Cart</h1>
          <p className="text-blue-700">Review and modify your items before checkout</p>
        </div>

        {state.items.length === 0 ? (
          <Card className="border-blue-200 shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ShoppingCart className="h-12 w-12 text-blue-400 mb-4" />
              <h3 className="text-lg font-medium text-blue-900 mb-2">Your cart is empty</h3>
              <p className="text-blue-600 mb-4">Add some items to get started</p>
              <Button onClick={() => (window.location.href = "/")} className="bg-blue-600 hover:bg-blue-700">
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="border-blue-200 shadow-lg">
              <CardHeader className="bg-blue-50">
                <CardTitle className="text-blue-900">Cart Items ({state.items.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {state.items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center space-x-4 p-4 border border-blue-100 rounded-lg bg-white"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg overflow-hidden flex-shrink-0">
                      {item.product.image ? (
                        <img
                          src={item.product.image || "/placeholder.svg"}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-8 w-8 text-blue-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-medium text-blue-900">{item.product.name}</h3>
                      <p className="text-sm text-blue-600 font-mono">Barcode: {item.product.barcode}</p>
                      <p className="text-sm text-blue-600">Category: {item.product.category}</p>
                      <p className="text-xs text-gray-500">
                        Original: {formatCurrency(item.product.price)}
                        {item.customPrice && item.customPrice !== item.product.price && (
                          <span className="text-orange-600 ml-2">→ {formatCurrency(item.customPrice)} (Adjusted)</span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="border-blue-200 hover:bg-blue-50"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="border-blue-200 hover:bg-blue-50"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-blue-600">₹</span>
                      <Input
                        type="number"
                        step="1"
                        value={item.customPrice || item.product.price}
                        onChange={(e) => updatePrice(item.product.id, Number.parseFloat(e.target.value) || 0)}
                        className="w-24 border-blue-200"
                      />
                    </div>

                    <div className="text-right">
                      <p className="font-medium text-blue-900">
                        {formatCurrency((item.customPrice || item.product.price) * item.quantity)}
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeItem(item.product.id)}
                      className="border-red-200 hover:bg-red-50 text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Discount Section */}
            <Card className="border-orange-200 shadow-lg">
              <CardHeader className="bg-orange-50">
                <CardTitle className="flex items-center gap-2 text-orange-900">
                  <Percent className="h-5 w-5" />
                  Apply Discount
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700">Discount Amount</label>
                    <Input
                      type="number"
                      step="1"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(Number.parseFloat(e.target.value) || 0)}
                      placeholder="Enter discount"
                      className="border-orange-200"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-2">Type</label>
                    <div className="flex gap-2">
                      <Button
                        variant={discountType === "amount" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setDiscountType("amount")}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        ₹ Amount
                      </Button>
                      <Button
                        variant={discountType === "percentage" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setDiscountType("percentage")}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        % Percent
                      </Button>
                    </div>
                  </div>
                </div>
                {discountAmount > 0 && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-800">
                      Discount Applied: {formatCurrency(calculateDiscount())}
                      {discountType === "percentage" && ` (${discountAmount}%)`}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-blue-200 shadow-lg">
              <CardHeader className="bg-blue-50">
                <CardTitle className="text-blue-900">Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(state.total)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-orange-600">
                      <span>Discount {discountType === "percentage" && `(${discountAmount}%)`}</span>
                      <span>- {formatCurrency(calculateDiscount())}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold text-blue-900">
                    <span>Total</span>
                    <span>{formatCurrency(finalTotal)}</span>
                  </div>
                  {finalTotal !== state.total && (
                    <p className="text-sm text-green-600">You saved {formatCurrency(state.total - finalTotal)}!</p>
                  )}
                </div>

                <Button
                  onClick={generateBill}
                  disabled={isProcessing || finalTotal < 0}
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  <Receipt className="h-4 w-4 mr-2" />
                  {isProcessing ? "Processing..." : "Generate Bill & Checkout"}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
