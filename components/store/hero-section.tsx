'use client'

import Link from 'next/link'
import Image from 'next/image'

export function HeroSection() {

  return (
    <section className="relative overflow-hidden bg-secondary/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid min-h-[500px] lg:min-h-[600px] items-center gap-8 py-12 lg:grid-cols-2 lg:py-0">
          {/* Content */}
          <div className="order-2 lg:order-1 text-center lg:text-left">
            <span className="inline-block text-sm font-medium tracking-widest uppercase text-primary mb-4">
              Luxury Beauty
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
              Discover Your
              <span className="block text-primary">Natural Glow</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground max-w-md mx-auto lg:mx-0">
              Premium skincare, fragrances, and makeup crafted for the modern woman. 
              Experience luxury beauty delivered to your door in Dar es Salaam.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Shop Now
              </Link>
              <Link
                href="/shop?category=skincare"
                className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-8 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Explore Skincare
              </Link>
            </div>
          </div>

          {/* Image */}
          <div className="order-1 lg:order-2 relative">
            <div className="relative aspect-square max-w-lg mx-auto lg:max-w-none">
              <div className="absolute inset-0 rounded-full bg-primary/10" />
              <div className="absolute inset-8 rounded-full bg-primary/5" />
              <Image
                src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800"
                alt="Luxury cosmetics collection"
                fill
                className="object-cover rounded-full p-4"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
    </section>
  )
}
