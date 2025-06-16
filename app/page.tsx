import { useCloudSync } from "@/hooks/use-cloud-sync"
import { SyncStatus } from "@/components/sync-status"

export default function Home() {
  const { products, syncStatus } = useCloudSync()

  return (
    <div>
      <h1>My Products</h1>
      {products ? (
        <ul>
          {products.map((product) => (
            <li key={product.id}>{product.name}</li>
          ))}
        </ul>
      ) : (
        <p>Loading products...</p>
      )}
      <SyncStatus />
    </div>
  )
}
