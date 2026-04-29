import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ProductForm } from '@/components/admin/product-form'

interface EditProductPageProps {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from('products').select('*').eq('id', id).single(),
    supabase.from('categories').select('*').order('name'),
  ])

  if (!product) {
    notFound()
  }

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
        <h1 className="text-2xl font-semibold text-foreground">Edit Product</h1>
        <p className="text-muted-foreground">Update product details</p>
      </div>

      <div className="max-w-3xl">
        <ProductForm product={product} categories={categories || []} />
      </div>
    </div>
  )
}
