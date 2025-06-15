"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Printer } from "lucide-react"
import type { Product } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { BarcodeGenerator } from "@/lib/barcode-generator"

interface BarcodeStickerProps {
  product: Product
}

export default function BarcodeSticker({ product }: BarcodeStickerProps) {
  const printSticker = () => {
    // Generate high-quality barcode for printing
    const barcodeImage = BarcodeGenerator.generateBarcodeDataURL(product.barcode, 300, 60)

    const stickerContent = `
<!DOCTYPE html>
<html>
  <head>
    <title>Barcode Sticker - ${product.name}</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { 
        font-family: Arial, sans-serif; 
        background: white;
        padding: 5px;
      }
      .sticker {
        width: 2.2in;
        height: 1.2in;
        border: 1px solid #333;
        border-radius: 4px;
        padding: 6px;
        background: white;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        page-break-after: always;
      }
      .header {
        text-align: center;
        margin-bottom: 3px;
      }
      .store-name {
        font-size: 9px;
        font-weight: bold;
        color: #1e40af;
      }
      .product-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 3px 0;
      }
      .product-name {
        font-size: 8px;
        font-weight: bold;
        color: #374151;
        max-width: 60%;
        line-height: 1.1;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .price {
        font-size: 11px;
        font-weight: bold;
        color: #1e40af;
      }
      .barcode-section {
        text-align: center;
        margin-top: 2px;
      }
      .barcode-image {
        width: 100%;
        height: 22px;
        object-fit: contain;
        margin-bottom: 2px;
        background: white;
        border: none;
      }
      .barcode-number {
        font-size: 7px;
        font-family: 'Courier New', monospace;
        color: #374151;
        letter-spacing: 0.5px;
        font-weight: bold;
      }
      @media print {
        body { padding: 0; margin: 0; }
        .sticker { margin: 0; border: 1px solid #000; }
        @page { 
          size: 2.2in 1.2in; 
          margin: 0; 
        }
        .barcode-image {
          -webkit-print-color-adjust: exact;
          color-adjust: exact;
        }
      }
    </style>
  </head>
  <body>
    <div class="sticker">
      <div class="header">
        <div class="store-name">MORAYA FASHION</div>
      </div>
      
      <div class="product-info">
        <div class="product-name">${product.name.length > 18 ? product.name.substring(0, 18) + "..." : product.name}</div>
        <div class="price">${formatCurrency(product.price)}</div>
      </div>
      
      <div class="barcode-section">
        <img src="${barcodeImage}" alt="Barcode ${product.barcode}" class="barcode-image" />
        <div class="barcode-number">${product.barcode}</div>
      </div>
    </div>
    
    <script>
      window.onload = function() {
        setTimeout(function() {
          window.print();
        }, 500);
      }
    </script>
  </body>
</html>
`

    const printWindow = window.open("", "_blank", "width=350,height=250")
    if (printWindow) {
      printWindow.document.write(stickerContent)
      printWindow.document.close()
    }
  }

  // Generate preview barcode
  const previewBarcodeImage = BarcodeGenerator.generateBarcodeDataURL(product.barcode, 200, 40)

  return (
    <Card className="w-52 border-blue-200">
      <CardContent className="p-3">
        <div className="text-center space-y-2">
          <div className="text-xs font-bold text-blue-600">MORAYA FASHION</div>

          <div className="flex justify-between items-center">
            <div className="text-xs font-medium text-gray-700 truncate flex-1 text-left">
              {product.name.length > 15 ? product.name.substring(0, 15) + "..." : product.name}
            </div>
            <div className="text-sm font-bold text-blue-600 ml-2">{formatCurrency(product.price)}</div>
          </div>

          {/* Real scannable barcode preview */}
          <div className="bg-white p-2 rounded border">
            <img
              src={previewBarcodeImage || "/placeholder.svg"}
              alt={`Barcode ${product.barcode}`}
              className="w-full h-6 object-contain mb-1"
            />
            <div className="text-xs font-mono font-bold">{product.barcode}</div>
          </div>

          <Button onClick={printSticker} size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-xs py-1">
            <Printer className="h-3 w-3 mr-1" />
            Print Scannable Sticker
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
