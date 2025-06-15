"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, Keyboard, Scan } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import type { Product } from "@/lib/types"
import { toast } from "@/hooks/use-toast"

export default function BarcodeScanner() {
  const [isScanning, setIsScanning] = useState(false)
  const [manualBarcode, setManualBarcode] = useState("")
  const [scanMode, setScanMode] = useState<"camera" | "manual">("manual")
  const videoRef = useRef<HTMLVideoElement>(null)
  const { dispatch } = useCart()

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsScanning(true)
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please use manual input.",
        variant: "destructive",
      })
      setScanMode("manual")
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    setIsScanning(false)
  }

  const searchProduct = async (barcode: string) => {
    try {
      const response = await fetch(`/api/products/barcode/${barcode}`)
      if (response.ok) {
        const product: Product = await response.json()

        // Check if product is in stock
        if (product.quantity > 0) {
          dispatch({ type: "ADD_ITEM", payload: product })
          toast({
            title: "Product Added to Cart",
            description: `${product.name} - ₹${product.price} added successfully`,
          })

          // Play success sound (optional)
          const audio = new Audio(
            "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT",
          )
          audio.play().catch(() => {}) // Ignore audio errors
        } else {
          toast({
            title: "Out of Stock",
            description: `${product.name} is currently out of stock`,
            variant: "destructive",
          })
        }

        setManualBarcode("")
      } else {
        toast({
          title: "Product Not Found",
          description: `No product found with barcode: ${barcode}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search for product",
        variant: "destructive",
      })
    }
  }

  const handleManualScan = () => {
    if (manualBarcode.trim()) {
      searchProduct(manualBarcode.trim())
    }
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            Barcode Scanner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={scanMode === "camera" ? "default" : "outline"}
              onClick={() => setScanMode("camera")}
              className="flex-1"
            >
              <Camera className="h-4 w-4 mr-2" />
              Camera
            </Button>
            <Button
              variant={scanMode === "manual" ? "default" : "outline"}
              onClick={() => setScanMode("manual")}
              className="flex-1"
            >
              <Keyboard className="h-4 w-4 mr-2" />
              Manual
            </Button>
          </div>

          {scanMode === "camera" && (
            <div className="space-y-4">
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-64 bg-gray-100 rounded-lg object-cover"
                />
                {!isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                    <div className="text-center">
                      <Camera className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500">Camera not active</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button onClick={startCamera} disabled={isScanning} className="flex-1">
                  Start Camera
                </Button>
                <Button onClick={stopCamera} disabled={!isScanning} variant="outline" className="flex-1">
                  Stop Camera
                </Button>
              </div>
              <p className="text-sm text-gray-500 text-center">Position the barcode within the camera view</p>
            </div>
          )}

          {scanMode === "manual" && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter barcode manually"
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleManualScan()}
                />
                <Button onClick={handleManualScan}>
                  <Scan className="h-4 w-4 mr-2" />
                  Scan
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Try scanning: 1234567890123, 2345678901234, 3456789012345, or 4567890123456
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
