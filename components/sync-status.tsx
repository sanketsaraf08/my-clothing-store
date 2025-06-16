"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cloud, CloudOff, Wifi, WifiOff, RefreshCw, CheckCircle, AlertCircle, Clock } from "lucide-react"
import { CloudSyncService } from "@/lib/sync/cloud-sync"
import { formatDistanceToNow } from "date-fns"

export function SyncStatus() {
  const [status, setStatus] = useState({
    isOnline: false,
    lastSyncTime: 0,
    syncInProgress: false,
  })
  const [isExpanded, setIsExpanded] = useState(false)

  const syncService = CloudSyncService.getInstance()

  useEffect(() => {
    const updateStatus = () => {
      setStatus(syncService.getStatus())
    }

    // Update immediately
    updateStatus()

    // Update every 5 seconds
    const interval = setInterval(updateStatus, 5000)

    // Listen for sync events
    const unsubscribe = syncService.onSync(() => {
      updateStatus()
    })

    return () => {
      clearInterval(interval)
      unsubscribe()
    }
  }, [])

  const handleForceSync = async () => {
    try {
      await syncService.forcSync()
    } catch (error) {
      console.error("Force sync failed:", error)
    }
  }

  const getStatusColor = () => {
    if (status.syncInProgress) return "bg-blue-500"
    if (status.isOnline) return "bg-green-500"
    return "bg-orange-500"
  }

  const getStatusText = () => {
    if (status.syncInProgress) return "Syncing..."
    if (status.isOnline) return "Online"
    return "Offline"
  }

  const getStatusIcon = () => {
    if (status.syncInProgress) return <RefreshCw className="h-3 w-3 animate-spin" />
    if (status.isOnline) return <Cloud className="h-3 w-3" />
    return <CloudOff className="h-3 w-3" />
  }

  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button variant="outline" size="sm" onClick={() => setIsExpanded(true)} className="bg-white shadow-lg border-2">
          {getStatusIcon()}
          <span className="ml-2">{getStatusText()}</span>
          <div className={`w-2 h-2 rounded-full ml-2 ${getStatusColor()}`} />
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 shadow-lg border-2">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              Cloud Sync Status
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(false)} className="h-6 w-6 p-0">
              ×
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Connection Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Connection:</span>
            <Badge variant={status.isOnline ? "default" : "secondary"} className="text-xs">
              {status.isOnline ? (
                <>
                  <Wifi className="h-3 w-3 mr-1" />
                  Online
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 mr-1" />
                  Offline
                </>
              )}
            </Badge>
          </div>

          {/* Sync Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Sync Status:</span>
            <Badge variant={status.syncInProgress ? "default" : "outline"} className="text-xs">
              {status.syncInProgress ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Syncing
                </>
              ) : (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Ready
                </>
              )}
            </Badge>
          </div>

          {/* Last Sync */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Last Sync:</span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {status.lastSyncTime > 0 ? formatDistanceToNow(status.lastSyncTime, { addSuffix: true }) : "Never"}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleForceSync}
              disabled={status.syncInProgress}
              className="flex-1 text-xs"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${status.syncInProgress ? "animate-spin" : ""}`} />
              Force Sync
            </Button>
          </div>

          {/* Status Messages */}
          {!status.isOnline && (
            <div className="flex items-start gap-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs">
              <AlertCircle className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-orange-800">Working Offline</p>
                <p className="text-orange-600">Changes will sync when connection is restored</p>
              </div>
            </div>
          )}

          {status.isOnline && (
            <div className="flex items-start gap-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
              <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-800">Cloud Connected</p>
                <p className="text-green-600">All devices are synced in real-time</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
