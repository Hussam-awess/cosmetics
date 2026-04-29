import { createClient } from '@/lib/supabase/server'
import { CategoryList } from '@/components/admin/category-list'

export default async function CategoriesPage() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  // Get product counts per category
  const { data: products } = await supabase
    .from('products')
    .select('category_id')

  const productCounts: Record<string, number> = {}
  products?.forEach(p => {
    if (p.category_id) {
      productCounts[p.category_id] = (productCounts[p.category_id] || 0) + 1
    }
  })

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Categories</h1>
        <p className="text-muted-foreground">Manage product categories</p>
      </div>

      <CategoryList categories={categories || []} productCounts={productCounts} />
    </div>
  )
}
