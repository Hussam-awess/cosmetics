import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/format'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Edit, Package } from 'lucide-react'

export default async function ProductsPage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products?.map(product => (
          <div key={product.id} className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="relative aspect-square bg-muted">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <Package className="h-12 w-12" />
                </div>
              )}
              {!product.active && (
                <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
                  <span className="rounded-full bg-card px-3 py-1 text-sm font-medium text-foreground">
                    Inactive
                  </span>
                </div>
              )}
              {product.featured && (
                <span className="absolute left-2 top-2 rounded-full bg-accent px-2 py-1 text-xs font-medium text-accent-foreground">
                  Featured
                </span>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-medium text-foreground truncate">{product.name}</h3>
              <p className="text-sm text-muted-foreground">
                {product.category?.name || 'No category'}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-semibold text-primary">
                  {formatPrice(product.price)}
                </span>
                <span className="text-sm text-muted-foreground">
                  Stock: {product.stock}
                </span>
              </div>
              <Link
                href={`/admin/products/${product.id}`}
                className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-border py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Link>
            </div>
          </div>
        ))}
        {(!products || products.length === 0) && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            No products found. Click &quot;Add Product&quot; to create one.
          </div>
        )}
      </div>
    </div>
  )
}
