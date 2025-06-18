        category: "dresses",
        image: "/placeholder.svg?height=300&width=300&text=Designer+Saree",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    // Set initial counter
    if (!localStorage.getItem(this.BARCODE_COUNTER_KEY)) {
      localStorage.setItem(this.BARCODE_COUNTER_KEY, "1000000006")
    }

    this.saveProducts(defaultProducts)
    return defaultProducts
  }

  // Add method to update stock after sale
  static updateProductStock(productId: string, soldQuantity: number): void {
    const products = this.getProducts()
    const productIndex = products.findIndex((p) => p.id === productId)

    if (productIndex !== -1) {
      products[productIndex].quantity -= soldQuantity
      products[productIndex].soldQuantity += soldQuantity
      products[productIndex].updatedAt = new Date()
      this.saveProducts(products)
    }
  }

  // Add method to get stock summary
  static getStockSummary(): StockSummary {
    const products = this.getProducts()

    return {
      totalProducts: products.length,
      totalCurrentStock: products.reduce((sum, p) => sum + p.quantity, 0),
      totalSoldStock: products.reduce((sum, p) => sum + p.soldQuantity, 0),
      totalStockValue: products.reduce((sum, p) => sum + p.quantity * p.price, 0),
      totalSoldValue: products.reduce((sum, p) => sum + p.soldQuantity * p.price, 0),
    }
  }
}
