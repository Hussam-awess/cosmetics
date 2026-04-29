'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag, Plus, Heart } from 'lucide-react'
import { Product } from '@/lib/types'
import { formatPrice } from '@/lib/format'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const { user } = useAuth()
  const [isInWishlist, setIsInWishlist] = useState(false)

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    
    if (!user) {
      // If not logged in, show auth modal or redirect
      alert('Please login to add items to wishlist')
      return
    }
    
    // Get current wishlist
    const wishlistKey = `wishlist_${user.id}`
    const currentWishlist = JSON.parse(localStorage.getItem(wishlistKey) || '[]')
    
    if (isInWishlist) {
      // Remove from wishlist
      const updatedWishlist = currentWishlist.filter((id: string) => id !== product.id)
      localStorage.setItem(wishlistKey, JSON.stringify(updatedWishlist))
      setIsInWishlist(false)
    } else {
      // Add to wishlist
      const updatedWishlist = [...currentWishlist, product.id]
      localStorage.setItem(wishlistKey, JSON.stringify(updatedWishlist))
      setIsInWishlist(true)
    }
  }

  // Check if product is in wishlist on mount
  useEffect(() => {
    if (!user) return
    
    const wishlistKey = `wishlist_${user.id}`
    const currentWishlist = JSON.parse(localStorage.getItem(wishlistKey) || '[]')
    setIsInWishlist(currentWishlist.includes(product.id))
  }, [product.id, user?.id])

  const discount = product.compare_at_price
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : null

  return (
    <div className="group relative">
      {/* Image */}
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <ShoppingBag className="h-12 w-12" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute left-3 top-3 flex flex-col gap-2">
            {product.featured && (
              <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                Featured
              </span>
            )}
            {discount && (
              <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                -{discount}%
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={toggleWishlist}
            className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-card/80 text-foreground shadow-lg opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-card"
            aria-label={`Add ${product.name} to wishlist`}
          >
            <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
          </button>

          {/* Quick Add Button */}
          <button
            onClick={(e) => {
              e.preventDefault()
              addItem(product)
            }}
            disabled={product.stock <= 0}
            className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-card text-foreground shadow-lg opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-primary hover:text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={`Add ${product.name} to cart`}
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </Link>

      {/* Details */}
      <div className="mt-4">
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-lg font-semibold text-primary">
            {formatPrice(product.price)}
          </span>
          {product.compare_at_price && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.compare_at_price)}
            </span>
          )}
        </div>
        {product.stock <= 0 && (
          <span className="mt-1 text-xs text-destructive">Out of stock</span>
        )}
        {product.stock > 0 && product.stock <= 5 && (
          <span className="mt-1 text-xs text-accent-foreground">
            Only {product.stock} left
          </span>
        )}
      </div>
    </div>
  )
}
