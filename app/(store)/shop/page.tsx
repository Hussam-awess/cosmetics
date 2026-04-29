import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/store/product-card'
import { CategoryFilter } from '@/components/store/category-filter'

interface ShopPageProps {
  searchParams: Promise<{ category?: string }>
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams
  const supabase = await createClient()

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  // Fetch products with optional category filter
  let query = supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('active', true)
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })

  if (params.category) {
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', params.category)
      .single()

    if (category) {
      query = query.eq('category_id', category.id)
    }
  }

  const { data: products } = await query

  const selectedCategory = categories?.find(c => c.slug === params.category)

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            {selectedCategory ? selectedCategory.name : 'All Products'}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {selectedCategory?.description || 'Explore our complete collection of luxury beauty products'}
          </p>
        </div>

        {/* Filters */}
        <CategoryFilter 
          categories={categories || []} 
          selectedCategory={params.category} 
        />

        {/* Products Grid */}
        {products && products.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-16 text-center">
            <p className="text-muted-foreground">
              No products found in this category.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
