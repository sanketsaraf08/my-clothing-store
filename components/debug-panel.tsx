"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StorageService } from "@/lib/storage"
import type { Product } from "@/lib/types"

export default function DebugPanel() {
  const [products, setProducts] = useState<Product[]>([])
  const [isVisible, setIsVisible] = useState(false)

  const refreshProducts = () => {
    const localProducts = StorageService.getProducts()
    setProducts(localProducts)
    console.log("Debug: Products in localStorage:", localProducts)
  }

  const clearStorage = () => {
    if (confirm("Are you sure you want to clear all products?")) {
      localStorage.removeItem("clothing_store_products")
      localStorage.removeItem("barcode_counter")
      refreshProducts()
    }
  }

  useEffect(() => {
    refreshProducts()
  }, [])

  if (!isVisible) {
    return (
      <Button onClick={() => setIsVisible(true)} variant="outline" size="sm" className="fixed bottom-4 right-4 z-50">
        Debug
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 max-h-96 overflow-auto z-50 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex justify-between items-center">
          Debug Panel
          <Button onClick={() => setIsVisible(false)} variant="ghost" size="sm">
            ×
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-xs">
          <strong>Products in Storage: {products.length}</strong>
        </div>
        <div className="flex gap-2">
          <Button onClick={refreshProducts} size="sm" variant="outline">
            Refresh
          </Button>
          <Button onClick={clearStorage} size="sm" variant="destructive">
            Clear All
          </Button>
        </div>
        <div className="max-h-32 overflow-auto text-xs">
          {products.map((product, index) => (
            <div key={product.id} className="border-b py-1">
              {index + 1}. {product.name} - {product.barcode}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
