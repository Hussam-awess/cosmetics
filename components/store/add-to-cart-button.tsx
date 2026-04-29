'use client'

import { useState } from 'react'
import { Minus, Plus, ShoppingBag } from 'lucide-react'
import { Product } from '@/lib/types'
import { useCart } from '@/lib/cart-context'

interface AddToCartButtonProps {
  product: Product
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCart()

  const handleAddToCart = () => {
    addItem(product, quantity)
    setQuantity(1)
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      {/* Quantity Selector */}
      <div className="flex items-center border border-border rounded-lg">
        <button
          onClick={() => setQuantity(q => Math.max(1, q - 1))}
          className="flex h-12 w-12 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Decrease quantity"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-12 text-center text-sm font-medium">{quantity}</span>
        <button
          onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
          disabled={quantity >= product.stock}
          className="flex h-12 w-12 items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Increase quantity"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={product.stock <= 0}
        className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ShoppingBag className="h-5 w-5" />
        {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
      </button>
    </div>
  )
}
