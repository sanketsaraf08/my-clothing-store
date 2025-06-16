"use client"

import type React from "react"

import { useState } from "react"
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import { useCloudSync } from "@/hooks/use-cloud-sync"
import { SyncStatus } from "@/components/sync-status"

// Define the Product type
type Product = {
  id: string
  name: string
  price: number
  description: string
}

const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "price",
    header: "Price",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const product = row.original
      return (
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => handleEditProduct(product)}>
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the product from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDeleteProduct(product.id)}>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )
    },
  },
]

const AdminPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const {
    products,
    createProduct: syncCreateProduct,
    updateProduct: syncUpdateProduct,
    deleteProduct: syncDeleteProduct,
    syncStatus,
    forceSync,
  } = useCloudSync()

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const handleCreateProduct = async (productData: any) => {
    setIsLoading(true)
    try {
      await syncCreateProduct(productData)
      setIsDialogOpen(false)
      setEditingProduct(null)
      toast({
        title: "Success",
        description: "Product created and synced across all devices",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create product",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateProduct = async (productData: any) => {
    setIsLoading(true)
    try {
      await syncUpdateProduct({ ...productData, id: editingProduct?.id })
      setIsDialogOpen(false)
      setEditingProduct(null)
      toast({
        title: "Success",
        description: "Product updated and synced across all devices",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    setIsLoading(true)
    try {
      await syncDeleteProduct(productId)
      toast({
        title: "Success",
        description: "Product deleted and synced across all devices",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setIsDialogOpen(true)
  }

  const handleSubmit = async (productData: any) => {
    if (editingProduct) {
      await handleUpdateProduct(productData)
    } else {
      await handleCreateProduct(productData)
    }
  }

  return (
    <div>
      <div className="container py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Admin</h1>
          <Button onClick={() => forceSync()}>Force Sync</Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add Product</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
                <DialogDescription>
                  {editingProduct ? "Update the product details." : "Create a new product."}
                </DialogDescription>
              </DialogHeader>
              <ProductForm
                onSubmit={handleSubmit}
                isLoading={isLoading}
                editingProduct={editingProduct}
                onCancel={() => {
                  setIsDialogOpen(false)
                  setEditingProduct(null)
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <SyncStatus />
    </div>
  )
}

type ProductFormProps = {
  onSubmit: (data: any) => void
  isLoading: boolean
  editingProduct: Product | null
  onCancel: () => void
}

const ProductForm = ({ onSubmit, isLoading, editingProduct, onCancel }: ProductFormProps) => {
  const [name, setName] = useState(editingProduct?.name || "")
  const [price, setPrice] = useState(editingProduct?.price?.toString() || "")
  const [description, setDescription] = useState(editingProduct?.description || "")

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit({
      name,
      price: Number.parseFloat(price),
      description,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Name
          </Label>
          <Input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="col-span-3"
            disabled={isLoading}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="price" className="text-right">
            Price
          </Label>
          <Input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="col-span-3"
            disabled={isLoading}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="description" className="text-right">
            Description
          </Label>
          <Input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="col-span-3"
            disabled={isLoading}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Loading..." : editingProduct ? "Update" : "Save"}
        </Button>
      </div>
    </form>
  )
}

export default AdminPage
