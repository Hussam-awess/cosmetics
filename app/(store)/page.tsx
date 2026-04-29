import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/store/product-card'
import { HeroSection } from '@/components/store/hero-section'
import { CategorySection } from '@/components/store/category-section'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch featured products
  const { data: featuredProducts } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('active', true)
    .eq('featured', true)
    .limit(4)

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  return (
    <div>
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Products */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                Featured Products
              </h2>
              <p className="mt-2 text-muted-foreground">
                Our most loved products, handpicked for you
              </p>
            </div>
            <Link
              href="/shop"
              className="hidden sm:flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts?.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <Link
            href="/shop"
            className="mt-8 flex sm:hidden items-center justify-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            View all products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Categories */}
      <CategorySection categories={categories || []} />

      {/* Value Propositions */}
      <section className="py-16 lg:py-24 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground">Free Delivery</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Free shipping on orders above TZS 100,000 within Dar es Salaam
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground">Authentic Products</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                100% genuine products sourced directly from trusted brands
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground">Easy Payment</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Pay with M-Pesa, Tigo Pesa, or cash on delivery
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
