import Link from 'next/link'
import Image from 'next/image'
import { Category } from '@/lib/types'

interface CategorySectionProps {
  categories: Category[]
}

const categoryImages: Record<string, string> = {
  skincare: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600',
  fragrance: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600',
  makeup: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600',
  'body-care': 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600',
}

export function CategorySection({ categories }: CategorySectionProps) {
  return (
    <section className="py-16 lg:py-24 bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">
            Shop by Category
          </h2>
          <p className="mt-2 text-muted-foreground">
            Find exactly what you&apos;re looking for
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map(category => (
            <Link
              key={category.id}
              href={`/shop?category=${category.slug}`}
              className="group relative overflow-hidden rounded-xl aspect-[4/5]"
            >
              <Image
                src={categoryImages[category.slug] || categoryImages.skincare}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-xl font-semibold text-card">
                  {category.name}
                </h3>
                <p className="mt-1 text-sm text-card/80">
                  {category.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
