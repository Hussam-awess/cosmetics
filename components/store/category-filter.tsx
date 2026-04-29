'use client'

import Link from 'next/link'
import { Category } from '@/lib/types'

interface CategoryFilterProps {
  categories: Category[]
  selectedCategory?: string
}

export function CategoryFilter({ categories, selectedCategory }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/shop"
        className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
          !selectedCategory
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-secondary-foreground hover:bg-muted'
        }`}
      >
        All
      </Link>
      {categories.map(category => (
        <Link
          key={category.id}
          href={`/shop?category=${category.slug}`}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            selectedCategory === category.slug
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-muted'
          }`}
        >
          {category.name}
        </Link>
      ))}
    </div>
  )
}
