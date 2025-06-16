"use client"

import { useState, useEffect } from "react"
import type { Product } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingCart, Search, Package, RefreshCw, AlertCircle, Cloud, CloudOff } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { formatCurrency } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import { db } from "@/lib/database-new"
import Navigation from "@/components/navigation"

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [systemStatus, setSystemStatus] = useState<"unknown" | "healthy" | "warning" | "error">("unknown")
  const [syncStatus, setSyncStatus] = useState<"online" | "offline" | "syncing">("offline")
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const { dispatch } = useCart()

  useEffect(() => {
    console.log("🚀 STORE PAGE: Starting initialization...")
    initializeStore()

    // Setup sync polling
    const syncInterval = setInterval(checkForUpdates, 10000) // Check every 10 seconds

    // Listen for data updates
    const handleDataUpdate = (event: any) => {
      console.log("📡 STORE PAGE: Data update received:", event.detail)
      fetchProducts()
    }

    if (typeof window !== "undefined") {
      window.addEventListener("moraya_data_updated", handleDataUpdate)
      window.addEventListener("online", () => setSyncStatus("online"))
      window.addEventListener("offline", () => setSyncStatus("offline"))

      // Set initial online status
      setSyncStatus(navigator.onLine ? "online" : "offline")

      return () => {
        clearInterval(syncInterval)
        window.removeEventListener("moraya_data_updated", handleDataUpdate)
        window.removeEventListener("online", () => setSyncStatus("online"))
        window.removeEventListener("offline", () => setSyncStatus("offline"))
      }
    }
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, searchTerm, selectedCategory])

  const checkForUpdates = async () => {
    if (syncStatus === "offline") return

    try {
      setSyncStatus("syncing")
      // Simulate cloud sync check
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setLastSync(new Date())
      setSyncStatus("online")
    } catch (error) {
      console.error("Sync check failed:", error)
      setSyncStatus("offline")
    }
  }

  const initializeStore = async () => {
    try {
      console.log("🔧 STORE PAGE: Initializing database...")
      await db.initialize()

      console.log("📦 STORE PAGE: Loading products...")
      await fetchProducts()

      setSystemStatus("healthy")
      console.log("✅ STORE PAGE: Initialization complete")
    } catch (error) {
      console.error("❌ STORE PAGE: Initialization failed:", error)
      setSystemStatus("error")
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      console.log("📦 STORE PAGE: Fetching products...")

      const data = await db.getProducts()
      console.log(`✅ STORE PAGE: Loaded ${data.length} products`)

      setProducts(data)

      if (data.length === 0) {
        setSystemStatus("warning")
        console.log("⚠️ STORE PAGE: No products found")
      } else {
        setSystemStatus("healthy")
      }
    } catch (error) {
      console.error("❌ STORE PAGE: Error fetching products:", error)
      setSystemStatus("error")

      toast({
        title: "Error",
        description: "Failed to load products. Check your connection and try again.",
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

  const handleReloadDemo = async () => {
    try {
      setLoading(true)
      setSyncStatus("syncing")
      console.log("🔄 STORE PAGE: Reloading demo products...")

      db.reloadDemoProducts()
      await fetchProducts()

      toast({
        title: "Demo Products Loaded",
        description: "Sample products have been loaded and synced across all devices",
      })

      setLastSync(new Date())
      setSyncStatus("online")
    } catch (error) {
      console.error("❌ STORE PAGE: Error reloading demo:", error)
      toast({
        title: "Error",
        description: "Failed to load demo products",
        variant: "destructive",
      })
      setSyncStatus("offline")
    } finally {
      setLoading(false)
    }
  }

  const forceSync = async () => {
    try {
      setSyncStatus("syncing")
      await fetchProducts()
      setLastSync(new Date())
      setSyncStatus("online")
      toast({
        title: "Sync Complete",
        description: "All devices are now synchronized",
      })
    } catch (error) {
      setSyncStatus("offline")
      toast({
        title: "Sync Failed",
        description: "Unable to sync. Check your connection.",
        variant: "destructive",
      })
    }
  }

  const categories = ["all", "shirts", "pants", "dresses", "shoes", "accessories"]

  const getSyncIcon = () => {
    switch (syncStatus) {
      case "online":
        return <Cloud className="h-4 w-4 text-green-500" />
      case "syncing":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      case "offline":
        return <CloudOff className="h-4 w-4 text-red-500" />
    }
  }

  const getSyncText = () => {
    switch (syncStatus) {
      case "online":
        return "Online & Synced"
      case "syncing":
        return "Syncing..."
      case "offline":
        return "Offline"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-blue-700">Loading Moraya Fashion Store...</p>
            <p className="text-sm text-blue-500 mt-2">Syncing across all devices...</p>
          </div>
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
            <div className="flex items-center justify-center gap-2 mt-2">
              {getSyncIcon()}
              <span className="text-sm text-gray-600">{getSyncText()}</span>
              {lastSync && <span className="text-xs text-gray-500">• Last sync: {lastSync.toLocaleTimeString()}</span>}
            </div>
          </div>

          {/* System Status Alert */}
          {systemStatus === "error" && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <h3 className="font-medium text-red-900">System Error</h3>
              </div>
              <p className="text-red-700 mt-1">
                Unable to load products. Check your internet connection and try refreshing.
              </p>
            </div>
          )}

          {systemStatus === "warning" && products.length === 0 && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  <div>
                    <h3 className="font-medium text-yellow-900">No Products Available</h3>
                    <p className="text-yellow-700 text-sm">Load demo products to get started</p>
                  </div>
                </div>
                <Button onClick={handleReloadDemo} variant="outline" className="bg-white">
                  Load Demo Products
                </Button>
              </div>
            </div>
          )}

          {/* Multi-Device Sync Info */}
          {products.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Cloud className="h-5 w-5 text-blue-500" />
                <h3 className="font-medium text-blue-900">Multi-Device Sync Active</h3>
              </div>
              <p className="text-blue-700 mt-1">
                Products sync across all your devices automatically. Changes appear within 10 seconds!
              </p>
            </div>
          )}

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
            <Button onClick={forceSync} variant="outline" className="bg-white">
              <Cloud className="h-4 w-4 mr-2" />
              Sync
            </Button>
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
              <h3 className="text-lg font-medium text-blue-900 mb-2">
                {products.length === 0 ? "No products available" : "No products found"}
              </h3>
              <p className="text-blue-600 mb-4">
                {products.length === 0
                  ? "Load demo products or add products in the admin panel"
                  : "Try adjusting your search or filter criteria"}
              </p>
              {products.length === 0 && (
                <Button onClick={handleReloadDemo} className="bg-blue-600 hover:bg-blue-700">
                  Load Demo Products
                </Button>
              )}
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
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                        e.currentTarget.nextElementSibling?.classList.remove("hidden")
                      }}
                    />
                  ) : null}
                  <Package className={`h-16 w-16 text-blue-400 ${product.image ? "hidden" : ""}`} />
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

      {/* Floating Sync Status */}
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border p-3">
        <div className="flex items-center gap-2">
          {getSyncIcon()}
          <div className="text-sm">
            <div className="font-medium">{getSyncText()}</div>
            {lastSync && <div className="text-xs text-gray-500">Last sync: {lastSync.toLocaleTimeString()}</div>}
          </div>
          <Button size="sm" variant="outline" onClick={forceSync}>
            Sync
          </Button>
        </div>
      </div>
    </div>
  )
}
