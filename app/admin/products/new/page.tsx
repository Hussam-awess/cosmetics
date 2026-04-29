import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ProductForm } from '@/components/admin/product-form'

export default async function NewProductPage() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  return (
    <div className="p-6 lg:p-8">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Products
      </Link>

      <div className="mt-6 mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Add New Product</h1>
        <p className="text-muted-foreground">Create a new product for your store</p>
      </div>

      <div className="max-w-3xl">
        <ProductForm categories={categories || []} />
      </div>
    </div>
  )
}
