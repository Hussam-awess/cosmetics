'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Heart, ShoppingBag } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { Product } from '@/lib/types'
import { formatPrice } from '@/lib/format'
import Link from 'next/link'
import Image from 'next/image'

export default function WishlistPage() {
  const { user } = useAuth()
  const [wishlist, setWishlist] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchWishlist()
    }
  }, [user])

  const fetchWishlist = async () => {
    try {
      // Get wishlist from localStorage
      const storedWishlist = localStorage.getItem(`wishlist_${user?.id}`)
      if (storedWishlist) {
        const productIds = JSON.parse(storedWishlist)
        
        // Fetch product details
        const { data: products } = await supabase
          .from('products')
          .select('*')
          .in('id', productIds)
          .eq('active', true)

        setWishlist(products || [])
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const removeFromWishlist = (productId: string) => {
    const updatedWishlist = wishlist.filter(item => item.id !== productId)
    setWishlist(updatedWishlist)
    
    // Update localStorage
    const productIds = updatedWishlist.map(item => item.id)
    localStorage.setItem(`wishlist_${user?.id}`, JSON.stringify(productIds))
  }

  const addToCart = (product: Product) => {
    // Import and use cart context
    // For now, redirect to shop with product
    window.location.href = `/product/${product.slug}`
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Alert>
            <AlertDescription>Please login to view your wishlist.</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Heart className="h-8 w-8 text-red-500" />
            My Wishlist
          </h1>
          <p className="text-muted-foreground mt-2">
            Products you've saved for later
          </p>
        </div>

        {wishlist.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Heart className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3>
              <p className="text-muted-foreground text-center mb-4">
                Start adding products you love to see them here.
              </p>
              <Link href="/shop">
                <Button>
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Start Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {wishlist.map((product) => (
              <Card key={product.id} className="group">
                <CardContent className="p-4">
                  <div className="relative aspect-square mb-4 overflow-hidden rounded-lg bg-muted">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <ShoppingBag className="h-12 w-12" />
                      </div>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                      onClick={() => removeFromWishlist(product.id)}
                    >
                      <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Link href={`/product/${product.slug}`}>
                      <h3 className="font-medium text-sm hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-primary">
                        {formatPrice(product.price)}
                      </span>
                      
                      {product.stock > 0 ? (
                        <Button
                          size="sm"
                          onClick={() => addToCart(product)}
                          className="text-xs"
                        >
                          Add to Cart
                        </Button>
                      ) : (
                        <span className="text-xs text-destructive">Out of stock</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
