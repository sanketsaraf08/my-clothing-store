"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Package, TrendingUp, DollarSign, ShoppingBag } from "lucide-react"
import type { Product, StockSummary } from "@/lib/types"
import { StorageService } from "@/lib/storage"
import { formatCurrency } from "@/lib/utils"
import Navigation from "@/components/navigation"

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [stockSummary, setStockSummary] = useState<StockSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch("/api/products")
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
        setStockSummary(StorageService.getStockSummary())
      }
    } catch (error) {
      console.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

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
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Moraya Fashion Dashboard</h1>
          <p className="text-blue-700">Track your inventory and sales performance</p>
        </div>

        {stockSummary && (
          <>
            {/* Main Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="border-blue-200 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                  <Package className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stockSummary.totalProducts}</div>
                  <p className="text-xs text-blue-100">Active products in inventory</p>
                </CardContent>
              </Card>

              <Card className="border-green-200 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Stock</CardTitle>
                  <TrendingUp className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stockSummary.totalCurrentStock}</div>
                  <p className="text-xs text-green-100">Items available</p>
                </CardContent>
              </Card>

              <Card className="border-purple-200 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sold Stock</CardTitle>
                  <ShoppingBag className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stockSummary.totalSoldStock}</div>
                  <p className="text-xs text-purple-100">Items sold</p>
                </CardContent>
              </Card>

              <Card className="border-orange-200 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(stockSummary.totalSoldValue)}</div>
                  <p className="text-xs text-orange-100">From sold inventory</p>
                </CardContent>
              </Card>
            </div>

            {/* Stock Value Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="border-blue-200 shadow-lg">
                <CardHeader className="bg-blue-50">
                  <CardTitle className="text-blue-900">📦 Current Stock Summary</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                      <div>
                        <p className="text-sm text-blue-600">Total Items in Stock</p>
                        <p className="text-2xl font-bold text-blue-900">{stockSummary.totalCurrentStock}</p>
                      </div>
                      <Package className="h-8 w-8 text-blue-500" />
                    </div>
                    <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                      <div>
                        <p className="text-sm text-green-600">Total Stock Value</p>
                        <p className="text-2xl font-bold text-green-900">
                          {formatCurrency(stockSummary.totalStockValue)}
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200 shadow-lg">
                <CardHeader className="bg-blue-50">
                  <CardTitle className="text-blue-900">💰 Sales Summary</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                      <div>
                        <p className="text-sm text-purple-600">Total Items Sold</p>
                        <p className="text-2xl font-bold text-purple-900">{stockSummary.totalSoldStock}</p>
                      </div>
                      <ShoppingBag className="h-8 w-8 text-purple-500" />
                    </div>
                    <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
                      <div>
                        <p className="text-sm text-orange-600">Total Revenue</p>
                        <p className="text-2xl font-bold text-orange-900">
                          {formatCurrency(stockSummary.totalSoldValue)}
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-orange-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        <Card className="border-blue-200 shadow-lg">
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <BarChart3 className="h-5 w-5" />
              Product Stock Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 border border-blue-100 rounded-lg bg-white hover:bg-blue-50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-blue-900">{product.name}</h3>
                    <p className="text-sm text-blue-600">Category: {product.category}</p>
                    <p className="text-sm text-blue-600">Price: {formatCurrency(product.price)}</p>
                    <p className="text-xs text-gray-500 font-mono">Barcode: {product.barcode}</p>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Current Stock</p>
                      <Badge
                        variant={product.quantity < 10 ? "destructive" : "default"}
                        className="bg-blue-100 text-blue-800"
                      >
                        {product.quantity}
                      </Badge>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-gray-500">Sold</p>
                      <Badge variant="outline" className="border-green-200 text-green-700">
                        {product.soldQuantity}
                      </Badge>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-gray-500">Stock Value</p>
                      <p className="font-medium text-blue-700">{formatCurrency(product.quantity * product.price)}</p>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-gray-500">Sold Value</p>
                      <p className="font-medium text-green-600">
                        {formatCurrency(product.soldQuantity * product.price)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
