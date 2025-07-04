"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BarChart3, Package, TrendingUp, DollarSign, ShoppingBag, RefreshCw, Eye } from "lucide-react"
import type { Product } from "@/lib/types"
import { db } from "@/lib/database-new"
import { formatCurrency } from "@/lib/utils"
import Navigation from "@/components/navigation"

interface StockSummary {
  totalProducts: number
  totalCurrentStock: number
  totalSoldStock: number
  totalStockValue: number
  totalSoldValue: number
}

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [stockSummary, setStockSummary] = useState<StockSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAllProducts, setShowAllProducts] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      console.log("📊 DASHBOARD: Loading data...")

      await db.initialize()
      const data = await db.getProducts()

      console.log(`📊 DASHBOARD: Loaded ${data.length} products`)
      setProducts(data)

      // Calculate stock summary
      const summary: StockSummary = {
        totalProducts: data.length,
        totalCurrentStock: data.reduce((sum, p) => sum + p.quantity, 0),
        totalSoldStock: data.reduce((sum, p) => sum + p.soldQuantity, 0),
        totalStockValue: data.reduce((sum, p) => sum + p.quantity * p.price, 0),
        totalSoldValue: data.reduce((sum, p) => sum + p.soldQuantity * p.price, 0),
      }

      setStockSummary(summary)
      console.log("📊 DASHBOARD: Stock summary calculated:", summary)
    } catch (error) {
      console.error("❌ DASHBOARD: Failed to load data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-blue-700">Loading Dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Mobile-friendly header */}
        <div className="mb-6 sm:mb-8">
          <div className="text-center mb-4">
            <div className="text-3xl sm:text-4xl mb-2">🕉️</div>
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-2">Moraya Fashion Dashboard</h1>
            <p className="text-sm sm:text-base text-blue-700">Track your inventory and sales performance</p>
          </div>

          <div className="flex justify-center">
            <Button onClick={fetchData} variant="outline" className="bg-white">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </div>

        {stockSummary && (
          <>
            {/* Mobile-optimized Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
              <Card className="border-blue-200 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
                  <CardTitle className="text-xs sm:text-sm font-medium">Total Products</CardTitle>
                  <Package className="h-3 w-3 sm:h-4 sm:w-4" />
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                  <div className="text-xl sm:text-2xl font-bold">{stockSummary.totalProducts}</div>
                  <p className="text-xs text-blue-100">Active products</p>
                </CardContent>
              </Card>

              <Card className="border-green-200 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
                  <CardTitle className="text-xs sm:text-sm font-medium">Current Stock</CardTitle>
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                  <div className="text-xl sm:text-2xl font-bold">{stockSummary.totalCurrentStock}</div>
                  <p className="text-xs text-green-100">Items available</p>
                </CardContent>
              </Card>

              <Card className="border-purple-200 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
                  <CardTitle className="text-xs sm:text-sm font-medium">Sold Stock</CardTitle>
                  <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4" />
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                  <div className="text-xl sm:text-2xl font-bold">{stockSummary.totalSoldStock}</div>
                  <p className="text-xs text-purple-100">Items sold</p>
                </CardContent>
              </Card>

              <Card className="border-orange-200 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
                  <CardTitle className="text-xs sm:text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                  <div className="text-lg sm:text-2xl font-bold">{formatCurrency(stockSummary.totalSoldValue)}</div>
                  <p className="text-xs text-orange-100">From sales</p>
                </CardContent>
              </Card>
            </div>

            {/* Mobile-optimized Stock Value Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <Card className="border-blue-200 shadow-lg">
                <CardHeader className="bg-blue-50 p-4 sm:p-6">
                  <CardTitle className="text-blue-900 text-lg sm:text-xl">📦 Current Stock Summary</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 sm:p-4 bg-blue-50 rounded-lg">
                      <div>
                        <p className="text-sm text-blue-600">Total Items in Stock</p>
                        <p className="text-xl sm:text-2xl font-bold text-blue-900">{stockSummary.totalCurrentStock}</p>
                      </div>
                      <Package className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
                    </div>
                    <div className="flex justify-between items-center p-3 sm:p-4 bg-green-50 rounded-lg">
                      <div>
                        <p className="text-sm text-green-600">Total Stock Value</p>
                        <p className="text-xl sm:text-2xl font-bold text-green-900">
                          {formatCurrency(stockSummary.totalStockValue)}
                        </p>
                      </div>
                      <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200 shadow-lg">
                <CardHeader className="bg-blue-50 p-4 sm:p-6">
                  <CardTitle className="text-blue-900 text-lg sm:text-xl">💰 Sales Summary</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 sm:p-4 bg-purple-50 rounded-lg">
                      <div>
                        <p className="text-sm text-purple-600">Total Items Sold</p>
                        <p className="text-xl sm:text-2xl font-bold text-purple-900">{stockSummary.totalSoldStock}</p>
                      </div>
                      <ShoppingBag className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
                    </div>
                    <div className="flex justify-between items-center p-3 sm:p-4 bg-orange-50 rounded-lg">
                      <div>
                        <p className="text-sm text-orange-600">Total Revenue</p>
                        <p className="text-xl sm:text-2xl font-bold text-orange-900">
                          {formatCurrency(stockSummary.totalSoldValue)}
                        </p>
                      </div>
                      <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Product Stock Status - Mobile Optimized */}
        <Card className="border-blue-200 shadow-lg">
          <CardHeader className="bg-blue-50 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="flex items-center gap-2 text-blue-900 text-lg sm:text-xl">
                <BarChart3 className="h-5 w-5" />
                Product Stock Status ({products.length} Products)
              </CardTitle>
              <Button
                onClick={() => setShowAllProducts(!showAllProducts)}
                variant="outline"
                size="sm"
                className="bg-white"
              >
                <Eye className="h-4 w-4 mr-2" />
                {showAllProducts ? "Show Less" : "Show All"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-2 sm:p-6">
            {products.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-blue-900 mb-2">No Products Found</h3>
                <p className="text-blue-600">Add products in the admin panel to see them here</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-4">
                {(showAllProducts ? products : products.slice(0, 5)).map((product) => (
                  <div
                    key={product.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border border-blue-100 rounded-lg bg-white hover:bg-blue-50 transition-colors gap-3 sm:gap-4"
                  >
                    {/* Product Info - Mobile Stacked */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-blue-900 text-sm sm:text-base truncate">{product.name}</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <Badge variant="outline" className="border-blue-200 text-blue-700 text-xs">
                          {product.category}
                        </Badge>
                        <span className="text-xs sm:text-sm text-blue-600">Price: {formatCurrency(product.price)}</span>
                      </div>
                      <p className="text-xs text-gray-500 font-mono mt-1">#{product.barcode}</p>
                    </div>

                    {/* Stock Info - Mobile Grid */}
                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 sm:gap-6">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">Current Stock</p>
                        <Badge
                          variant={product.quantity < 10 ? "destructive" : "default"}
                          className={`${
                            product.quantity < 10 ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                          } text-xs sm:text-sm`}
                        >
                          {product.quantity}
                        </Badge>
                      </div>

                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">Sold</p>
                        <Badge variant="outline" className="border-green-200 text-green-700 text-xs sm:text-sm">
                          {product.soldQuantity}
                        </Badge>
                      </div>

                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">Stock Value</p>
                        <p className="font-medium text-blue-700 text-xs sm:text-sm">
                          {formatCurrency(product.quantity * product.price)}
                        </p>
                      </div>

                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">Sold Value</p>
                        <p className="font-medium text-green-600 text-xs sm:text-sm">
                          {formatCurrency(product.soldQuantity * product.price)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {!showAllProducts && products.length > 5 && (
                  <div className="text-center py-4">
                    <Button onClick={() => setShowAllProducts(true)} variant="outline" className="bg-white">
                      Show {products.length - 5} More Products
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
