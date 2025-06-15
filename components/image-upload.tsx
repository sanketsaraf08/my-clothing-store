"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, ImageIcon } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onRemove: () => void
}

export default function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size must be less than 5MB",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const filename = `products/${Date.now()}-${file.name}`

      const response = await fetch(`/api/upload?filename=${encodeURIComponent(filename)}`, {
        method: "POST",
        body: file,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const blob = await response.json()
      onChange(blob.url)

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      })
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <div className="space-y-4">
      <Label>Product Image</Label>

      {value ? (
        <div className="relative">
          <div className="relative w-full h-48 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
            <img src={value || "/placeholder.svg"} alt="Product preview" className="w-full h-full object-cover" />
            <Button type="button" variant="destructive" size="sm" className="absolute top-2 right-2" onClick={onRemove}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center space-y-2">
          <ImageIcon className="h-12 w-12 text-gray-400" />
          <p className="text-sm text-gray-500">No image selected</p>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex-1"
        >
          <Upload className="h-4 w-4 mr-2" />
          {isUploading ? "Uploading..." : "Upload Image"}
        </Button>

        <Input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
      </div>

      <div className="text-xs text-gray-500">Supported formats: JPG, PNG, GIF, WebP (max 5MB)</div>
    </div>
  )
}
