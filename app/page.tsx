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
import { db } from "@/lib/database/hybrid-service"
import Navigation from "@/components/navigation"

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const { dispatch } = useCart()

  useEffect(() => {
    initializeStore()

    // Subscribe to real-time updates
    const unsubscribe = db.subscribeToProducts((updatedProducts) => {
      setProducts(updatedProducts)
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, searchTerm, selectedCategory])

  const initializeStore = async () => {
    try {
      await db.initialize()
      await fetchProducts()
    } catch (error) {
      console.error("Failed to initialize store:", error)
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const data = await db.getProducts()
      setProducts(data)
    } catch (error) {
      console.error("Failed to fetch products:", error)
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
        description: `${product.name} added${customPrice ? ` at ${formatCurrency(customPrice)}` : ""}`,
      })
    } else {
      toast({
        title: "Out of Stock",
        description: `${product.name} is currently out of stock`,
        variant: "destructive",
      })
    }
  }

  const handleLoadDemo = async () => {
    try {
      setLoading(true)

      // Create demo products
      const demoProducts = [
        {
          name: "Premium Cotton Shirt",
          barcode: "1000000001",
          price: 899,
          quantity: 25,
          soldQuantity: 5,
          category: "shirts",
        },
        {
          name: "Designer Jeans",
          barcode: "1000000002",
          price: 1299,
          quantity: 15,
          soldQuantity: 8,
          category: "pants",
        },
        {
          name: "Elegant Dress",
          barcode: "1000000003",
          price: 1599,
          quantity: 12,
          soldQuantity: 3,
          category: "dresses",
        },
        {
          name: "Casual Sneakers",
          barcode: "1000000004",
          price: 2199,
          quantity: 20,
          soldQuantity: 7,
          category: "shoes",
        },
        {
          name: "Leather Handbag",
          barcode: "1000000005",
          price: 2499,
          quantity: 8,
          soldQuantity: 2,
          category: "accessories",
        },
      ]

      for (const product of demoProducts) {
        await db.createProduct(product)
      }

      await fetchProducts()
      toast({
        title: "Demo Products Loaded",
        description: "Sample products have been added to your store",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load demo products",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const categories = ["all", "shirts", "pants", "dresses", "shoes", "accessories"]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-blue-700">Loading Moraya Fashion Store...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <div className="text-center mb-4 sm:mb-6">
            <div className="text-3xl sm:text-4xl mb-2">🕉️</div>
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-2">Moraya Fashion</h1>
            <p className="text-sm sm:text-base text-blue-700">Ganpati Bappa Morya • Premium Fashion Collection</p>
          </div>

          {/* Search and filters */}
          <div className="space-y-3 sm:space-y-0 sm:flex sm:gap-4 mb-4 sm:mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-4 w-4" />
              <Input
                placeholder="Search products or scan barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-blue-200 focus:border-blue-400 text-sm sm:text-base"
              />
            </div>
            <div className="flex gap-2 sm:gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="flex-1 sm:w-48 border-blue-200 text-sm">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === "all" ? "All Categories" : category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={fetchProducts} variant="outline" className="bg-white" size="sm">
                <RefreshCw className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <Card className="border-blue-200 shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
              <Package className="h-10 w-10 sm:h-12 sm:w-12 text-blue-400 mb-4" />
              <h3 className="text-lg font-medium text-blue-900 mb-2">
                {products.length === 0 ? "No products available" : "No products found"}
              </h3>
              <p className="text-blue-600 mb-4 text-center text-sm sm:text-base">
                {products.length === 0
                  ? "Add products in the admin panel or load demo products"
                  : "Try adjusting your search or filter criteria"}
              </p>
              {products.length === 0 && (
                <Button onClick={handleLoadDemo} className="bg-blue-600 hover:bg-blue-700">
                  Load Demo Products
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
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
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                        e.currentTarget.nextElementSibling?.classList.remove("hidden")
                      }}
                    />
                  ) : null}
                  <Package className={`h-12 w-12 sm:h-16 sm:w-16 text-blue-400 ${product.image ? "hidden" : ""}`} />
                </div>
                <CardHeader className="pb-2 p-3 sm:p-6">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-sm sm:text-lg line-clamp-2 text-blue-900">{product.name}</CardTitle>
                    <Badge
                      variant={product.quantity > 0 ? "default" : "destructive"}
                      className="bg-blue-100 text-blue-800 text-xs shrink-0"
                    >
                      {product.quantity > 0 ? `${product.quantity}` : "Out"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg sm:text-2xl font-bold text-blue-600">
                        {formatCurrency(product.price)}
                      </span>
                      <Badge variant="outline" className="border-blue-200 text-blue-700 text-xs">
                        {product.category}
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-blue-600 font-mono">#{product.barcode}</p>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        type="number"
                        step="1"
                        placeholder="Custom price (₹)"
                        className="text-xs sm:text-sm border-blue-200"
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
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
                        size="sm"
                      >
                        <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
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
