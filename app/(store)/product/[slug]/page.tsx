import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { ShoppingBag } from 'lucide-react'
import { formatPrice } from '@/lib/format'
import { AddToCartButton } from '@/components/store/add-to-cart-button'
import { ProductCard } from '@/components/store/product-card'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('slug', slug)
    .eq('active', true)
    .single()

  if (!product) {
    notFound()
  }

  // Fetch related products
  const { data: relatedProducts } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('active', true)
    .eq('category_id', product.category_id)
    .neq('id', product.id)
    .limit(4)

  const discount = product.compare_at_price
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : null

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Product Image */}
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <ShoppingBag className="h-24 w-24" />
              </div>
            )}

            {/* Badges */}
            <div className="absolute left-4 top-4 flex flex-col gap-2">
              {product.featured && (
                <span className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground">
                  Featured
                </span>
              )}
              {discount && (
                <span className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground">
                  Save {discount}%
                </span>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="flex flex-col">
            {/* Category */}
            {product.category && (
              <span className="text-sm font-medium uppercase tracking-wider text-primary">
                {product.category.name}
              </span>
            )}

            {/* Name */}
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {product.name}
            </h1>

            {/* Price */}
            <div className="mt-4 flex items-center gap-3">
              <span className="text-2xl font-semibold text-primary">
                {formatPrice(product.price)}
              </span>
              {product.compare_at_price && (
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(product.compare_at_price)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="mt-6 text-muted-foreground leading-relaxed">
              {product.description}
            </p>

            {/* Stock Status */}
            <div className="mt-6">
              {product.stock > 0 ? (
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm text-muted-foreground">
                    {product.stock > 10 ? 'In Stock' : `Only ${product.stock} left`}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-destructive" />
                  <span className="text-sm text-destructive">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Add to Cart */}
            <div className="mt-8">
              <AddToCartButton product={product} />
            </div>

            {/* Features */}
            <div className="mt-10 border-t border-border pt-10">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                Why You&apos;ll Love It
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Premium quality ingredients
                </li>
                <li className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Dermatologically tested
                </li>
                <li className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Cruelty-free and vegan
                </li>
                <li className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Sustainable packaging
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <section className="mt-24">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              You May Also Like
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
