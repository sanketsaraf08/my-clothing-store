"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Receipt, Download, Eye } from "lucide-react"
import type { Bill } from "@/lib/types"
import { StorageService } from "@/lib/storage"
import { formatCurrency } from "@/lib/utils"
import Navigation from "@/components/navigation"

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([])
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)

  useEffect(() => {
    const savedBills = StorageService.getBills()
    setBills(savedBills.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
  }, [])

  const generateQRCode = async (data: string): Promise<string> => {
    // Simple QR code generation using a data URL
    // In a real app, you'd use a proper QR code library
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    canvas.width = 200
    canvas.height = 200

    if (ctx) {
      ctx.fillStyle = "#000000"
      ctx.fillRect(0, 0, 200, 200)
      ctx.fillStyle = "#FFFFFF"
      ctx.font = "12px Arial"
      ctx.fillText("QR Code", 10, 100)
      ctx.fillText("(Simulated)", 10, 120)
    }

    return canvas.toDataURL()
  }

  const printBill = async (bill: Bill) => {
    const qrCodeUrl = await generateQRCode(bill.qrCode)

    const printContent = `
<!DOCTYPE html>
<html>
  <head>
    <title>Bill #${bill.id}</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { 
        font-family: 'Courier New', monospace; 
        font-size: 12px; 
        line-height: 1.4;
        color: #000;
        background: white;
        padding: 20px;
        max-width: 300px;
        margin: 0 auto;
      }
      .header { 
        text-align: center; 
        margin-bottom: 20px; 
        border-bottom: 2px solid #000;
        padding-bottom: 10px;
      }
      .ganpati { font-size: 20px; margin-bottom: 5px; }
      .store-name { font-weight: bold; font-size: 16px; margin-bottom: 5px; }
      .blessing { font-size: 10px; font-style: italic; }
      .bill-info { margin-bottom: 15px; }
      .items-table { 
        width: 100%; 
        border-collapse: collapse; 
        margin-bottom: 15px; 
      }
      .items-table th, .items-table td { 
        padding: 3px; 
        text-align: left; 
        border-bottom: 1px dashed #000;
      }
      .items-table th { font-weight: bold; }
      .total-section { 
        border-top: 2px solid #000; 
        padding-top: 10px; 
        margin-bottom: 15px;
      }
      .total-row { 
        display: flex; 
        justify-content: space-between; 
        margin-bottom: 3px;
      }
      .grand-total { 
        font-weight: bold; 
        font-size: 14px; 
        border-top: 1px solid #000;
        padding-top: 5px;
        margin-top: 5px;
      }
      .payment-info { 
        text-align: center; 
        margin: 15px 0; 
        border: 1px solid #000;
        padding: 10px;
      }
      .upi-id { 
        font-weight: bold; 
        font-size: 14px; 
        margin: 5px 0;
      }
      .qr-code { text-align: center; margin: 15px 0; }
      .thank-you { 
        text-align: center; 
        margin-top: 20px; 
        border-top: 2px solid #000;
        padding-top: 10px;
        font-weight: bold;
      }
      .footer { 
        text-align: center; 
        font-size: 10px; 
        margin-top: 15px;
        font-style: italic;
      }
      @media print { 
        body { padding: 0; margin: 0; }
        .no-print { display: none; }
      }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="ganpati">🕉️ ॐ गं गणपतये नमः 🕉️</div>
      <div class="store-name">MORAYA FASHION</div>
      <div class="blessing">Ganpati Bappa Morya</div>
    </div>
    
    <div class="bill-info">
      <div><strong>Bill No:</strong> ${bill.id}</div>
      <div><strong>Date:</strong> ${new Date(bill.createdAt).toLocaleString()}</div>
      <div><strong>Store:</strong> Moraya Fashion</div>
    </div>
    
    <table class="items-table">
      <thead>
        <tr>
          <th>Item</th>
          <th>Qty</th>
          <th>Rate</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        ${bill.items
          .map(
            (item) => `
          <tr>
            <td>${item.product.name}</td>
            <td>${item.quantity}</td>
            <td>₹${(item.customPrice || item.product.price).toFixed(2)}</td>
            <td>₹${((item.customPrice || item.product.price) * item.quantity).toFixed(2)}</td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
    
    <div class="total-section">
      <div class="total-row">
        <span>Subtotal:</span>
        <span>₹${bill.subtotal.toFixed(2)}</span>
      </div>
      <div class="total-row">
        <span>Discount:</span>
        <span>- ₹${bill.discount.toFixed(2)}</span>
      </div>
      <div class="total-row grand-total">
        <span>TOTAL:</span>
        <span>₹${bill.total.toFixed(2)}</span>
      </div>
    </div>
    
    <div class="payment-info">
      <div><strong>UPI PAYMENT</strong></div>
      <div class="upi-id">${bill.upiId}</div>
      <div>Scan QR code below to pay</div>
    </div>
    
    <div class="qr-code">
      <img src="${qrCodeUrl}" alt="Payment QR Code" style="width: 100px; height: 100px;" />
    </div>
    
    <div class="thank-you">
      🙏 THANK YOU FOR SHOPPING 🙏
      <div style="font-size: 10px; margin-top: 5px;">
        Ganpati Bappa Morya • Visit Again
      </div>
    </div>
    
    <div class="footer">
      Moraya Fashion • Blessed by Lord Ganpati
    </div>
    
    <div class="no-print" style="margin-top: 20px; text-align: center;">
      <button onclick="window.print()" style="margin: 5px; padding: 10px;">Print Bill</button>
      <button onclick="window.close()" style="margin: 5px; padding: 10px;">Close</button>
    </div>
  </body>
</html>
`

    const printWindow = window.open("", "_blank", "width=400,height=600")
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()

      // Auto-print after a short delay
      setTimeout(() => {
        printWindow.print()
      }, 500)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bills & Receipts</h1>
          <p className="text-gray-600">View and manage your transaction history</p>
        </div>

        {bills.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Receipt className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bills found</h3>
              <p className="text-gray-500">Complete a purchase to see your bills here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Recent Bills</h2>
              {bills.map((bill) => (
                <Card key={bill.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">Bill #{bill.id}</CardTitle>
                      <Badge variant="outline">{new Date(bill.createdAt).toLocaleDateString()}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        {bill.items.length} item{bill.items.length !== 1 ? "s" : ""}
                      </p>
                      <p className="text-lg font-bold text-blue-600">Total: {formatCurrency(bill.total)}</p>
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" onClick={() => setSelectedBill(bill)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => printBill(bill)}>
                          <Download className="h-4 w-4 mr-2" />
                          Print
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedBill && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Bill Details</h2>
                <Card>
                  <CardHeader>
                    <CardTitle>Bill #{selectedBill.id}</CardTitle>
                    <p className="text-gray-600">{new Date(selectedBill.createdAt).toLocaleString()}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Items:</h3>
                      <div className="space-y-2">
                        {selectedBill.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <div>
                              <p className="font-medium">{item.product.name}</p>
                              <p className="text-sm text-gray-600">
                                {item.quantity} × {formatCurrency(item.customPrice || item.product.price)}
                              </p>
                            </div>
                            <p className="font-medium">
                              {formatCurrency((item.customPrice || item.product.price) * item.quantity)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(selectedBill.total)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Discount:</span>
                        <span>- {formatCurrency(selectedBill.discount)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>{formatCurrency(selectedBill.total)}</span>
                      </div>
                    </div>

                    <Button onClick={() => printBill(selectedBill)} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Print Receipt
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
