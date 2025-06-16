"use client"

import { useEffect, useState, useCallback } from "react"
import { CloudSyncService, type SyncEvent, type SyncStatus } from "@/lib/sync/cloud-sync"
import type { Product, Bill } from "@/lib/types"

export function useCloudSync() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: false,
    lastSyncTime: 0,
    syncInProgress: false,
  })
  const [products, setProducts] = useState<Product[]>([])
  const [bills, setBills] = useState<Bill[]>([])

  const syncService = CloudSyncService.getInstance()

  useEffect(() => {
    // Initialize sync service
    syncService.initialize()

    // Listen for sync events
    const unsubscribe = syncService.onSync((event: SyncEvent) => {
      console.log("🔄 SYNC EVENT:", event.type)

      switch (event.type) {
        case "sync_complete":
          setSyncStatus(syncService.getStatus())
          break

        case "products_updated":
          if (event.products) {
            setProducts([...event.products])
          }
          break

        case "bills_updated":
          if (event.bills) {
            setBills([...event.bills])
          }
          break

        case "product_created":
        case "product_updated":
          if (event.product) {
            setProducts((prev) => {
              const filtered = prev.filter((p) => p.id !== event.product!.id)
              return [event.product!, ...filtered]
            })
          }
          break

        case "product_deleted":
          if (event.productId) {
            setProducts((prev) => prev.filter((p) => p.id !== event.productId))
          }
          break

        case "bill_created":
          if (event.bill) {
            setBills((prev) => [event.bill!, ...prev])
          }
          break
      }
    })

    // Update status periodically
    const statusInterval = setInterval(() => {
      setSyncStatus(syncService.getStatus())
    }, 5000)

    return () => {
      unsubscribe()
      clearInterval(statusInterval)
    }
  }, [])

  const createProduct = useCallback(async (productData: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
    return await syncService.createProduct(productData)
  }, [])

  const updateProduct = useCallback(async (id: string, updates: Partial<Product>) => {
    return await syncService.updateProduct(id, updates)
  }, [])

  const deleteProduct = useCallback(async (id: string) => {
    await syncService.deleteProduct(id)
  }, [])

  const createBill = useCallback(async (billData: Omit<Bill, "id" | "createdAt">) => {
    return await syncService.createBill(billData)
  }, [])

  const forceSync = useCallback(async () => {
    await syncService.forcSync()
  }, [])

  return {
    // Data
    products,
    bills,

    // Status
    syncStatus,
    isOnline: syncStatus.isOnline,
    lastSyncTime: syncStatus.lastSyncTime,
    syncInProgress: syncStatus.syncInProgress,

    // Actions
    createProduct,
    updateProduct,
    deleteProduct,
    createBill,
    forceSync,
  }
}
