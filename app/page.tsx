"use client"

import { useState, useEffect } from "react"
import type { Product } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingCart, Search, Package, RefreshCw } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { formatCurrency } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import Navigation from "@/components/navigation"

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const { dispatch } = useCart()

  useEffect(() => {
    fetchProducts()

    // Listen for storage changes
    const handleStorageChange = () => {
      console.log("Storage changed on store page, refreshing...")
      fetchProducts()
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, searchTerm, selectedCategory])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/products", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })
      if (response.ok) {
        const data = await response.json()
        console.log("Store page: Loaded products:", data.length)
        setProducts(data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = products

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.barcode.includes(searchTerm),
      )
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) => product.category === selectedCategory)
    }

    setFilteredProducts(filtered)
  }

  const addToCart = (product: Product, customPrice?: number) => {
    if (product.quantity > 0) {
      const productToAdd = customPrice ? { ...product, price: customPrice } : product
      dispatch({ type: "ADD_ITEM", payload: productToAdd })
      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart${customPrice ? ` at ${formatCurrency(customPrice)}` : ""}`,
      })
    } else {
      toast({
        title: "Out of Stock",
        description: `${product.name} is currently out of stock`,
        variant: "destructive",
      })
    }
  }

  const categories = ["all", "shirts", "pants", "dresses", "shoes", "accessories"]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">🕉️</div>
            <h1 className="text-3xl font-bold text-blue-900 mb-2">Moraya Fashion</h1>
            <p className="text-blue-700">Ganpati Bappa Morya • Premium Fashion Collection</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-4 w-4" />
              <Input
                placeholder="Search products or scan barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-blue-200 focus:border-blue-400"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48 border-blue-200">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "All Categories" : category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={fetchProducts} variant="outline" className="bg-white">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <Card className="border-blue-200 shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-blue-400 mb-4" />
              <h3 className="text-lg font-medium text-blue-900 mb-2">No products found</h3>
              <p className="text-blue-600">Try adjusting your search or filter criteria</p>
              <p className="text-sm text-blue-500 mt-2">Total products in store: {products.length}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="overflow-hidden hover:shadow-xl transition-all duration-300 border-blue-200 bg-white"
              >
                <div className="aspect-square bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <Package className="h-16 w-16 text-blue-400" />
                  )}
                </div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-2 text-blue-900">{product.name}</CardTitle>
                    <Badge
                      variant={product.quantity > 0 ? "default" : "destructive"}
                      className="bg-blue-100 text-blue-800"
                    >
                      {product.quantity > 0 ? `${product.quantity} in stock` : "Out of stock"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-blue-600">{formatCurrency(product.price)}</span>
                      <Badge variant="outline" className="border-blue-200 text-blue-700">
                        {product.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-blue-600 font-mono">Barcode: {product.barcode}</p>
                    <p className="text-sm text-blue-600">
                      Stock: {product.quantity} | Sold: {product.soldQuantity}
                    </p>

                    <div className="flex gap-2">
                      <Input
                        type="number"
                        step="1"
                        placeholder="Custom price (₹)"
                        className="text-sm border-blue-200"
                        id={`price-${product.id}`}
                      />
                      <Button
                        onClick={() => {
                          const customPriceInput = document.getElementById(`price-${product.id}`) as HTMLInputElement
                          const customPrice = customPriceInput?.value
                            ? Number.parseFloat(customPriceInput.value)
                            : undefined
                          addToCart(product, customPrice)
                          if (customPriceInput) customPriceInput.value = ""
                        }}
                        disabled={product.quantity === 0}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
