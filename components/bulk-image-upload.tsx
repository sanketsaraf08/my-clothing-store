"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Check } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import type { Product } from "@/lib/types"

interface BulkImageUploadProps {
  products: Product[]
  onUpdate: () => void
}

export default function BulkImageUpload({ products, onUpdate }: BulkImageUploadProps) {
  const [uploading, setUploading] = useState<string[]>([])
  const [completed, setCompleted] = useState<string[]>([])

  const handleFileUpload = async (productId: string, file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      })
      return
    }

    setUploading((prev) => [...prev, productId])

    try {
      const filename = `products/${productId}-${Date.now()}-${file.name}`

      const response = await fetch(`/api/upload?filename=${encodeURIComponent(filename)}`, {
        method: "POST",
        body: file,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const blob = await response.json()

      // Update product with new image
      const updateResponse = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: blob.url }),
      })

      if (updateResponse.ok) {
        setCompleted((prev) => [...prev, productId])
        toast({
          title: "Success",
          description: "Image uploaded successfully",
        })
        onUpdate()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      })
    } finally {
      setUploading((prev) => prev.filter((id) => id !== productId))
    }
  }

  const productsWithoutImages = products.filter((p) => !p.image)

  if (productsWithoutImages.length === 0) {
    return null
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg">Bulk Image Upload</CardTitle>
        <p className="text-sm text-gray-600">Upload images for products that don't have them yet</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {productsWithoutImages.map((product) => (
            <div key={product.id} className="border rounded-lg p-4">
              <h4 className="font-medium text-sm mb-2 truncate">{product.name}</h4>
              <div className="w-full h-24 bg-gray-100 rounded mb-2 flex items-center justify-center">
                {completed.includes(product.id) ? (
                  <Check className="h-8 w-8 text-green-500" />
                ) : (
                  <span className="text-xs text-gray-500">No image</span>
                )}
              </div>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      handleFileUpload(product.id, file)
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploading.includes(product.id) || completed.includes(product.id)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={uploading.includes(product.id) || completed.includes(product.id)}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading.includes(product.id)
                    ? "Uploading..."
                    : completed.includes(product.id)
                      ? "Uploaded"
                      : "Upload"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
