'use client'

import Link from 'next/link'
import { ShoppingBag, Menu, X, User } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'
import { UserProfile } from '@/components/auth/user-profile'
import { AuthModal } from '@/components/auth/auth-modal'

export function Header() {
  const { itemCount, setIsOpen } = useCart()
  const { user } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMessage, setAuthMessage] = useState('')

  useEffect(() => {
    const handleRequireAuth = (event: CustomEvent) => {
      setAuthMessage(event.detail.message)
      setAuthModalOpen(true)
    }

    window.addEventListener('requireAuth', handleRequireAuth as EventListener)
    return () => {
      window.removeEventListener('requireAuth', handleRequireAuth as EventListener)
    }
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-semibold tracking-wide text-foreground">
              Niffer
            </span>
            <span className="text-sm font-light tracking-widest text-muted-foreground uppercase">
              Cosmetics
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Home
            </Link>
            <Link
              href="/shop"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Shop
            </Link>
            <Link
              href="/shop?category=skincare"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Skincare
            </Link>
            <Link
              href="/shop?category=fragrance"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Fragrance
            </Link>
            <Link
              href="/shop?category=makeup"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Makeup
            </Link>
          </nav>

          {/* Cart Button */}
          <div className="flex items-center gap-4">
            {/* User Profile / Login Button */}
            {user ? (
              <UserProfile />
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
              >
                <User className="h-4 w-4" />
                <span>Login</span>
              </button>
            )}

            <button
              onClick={() => setIsOpen(true)}
              className="relative p-2 text-foreground transition-colors hover:text-primary"
              aria-label="Open cart"
            >
              <ShoppingBag className="h-6 w-6" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-foreground md:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="border-t border-border py-4 md:hidden">
            <div className="flex flex-col gap-4">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Home
              </Link>
              <Link
                href="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Shop All
              </Link>
              <Link
                href="/shop?category=skincare"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Skincare
              </Link>
              <Link
                href="/shop?category=fragrance"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Fragrance
              </Link>
              <Link
                href="/shop?category=makeup"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Makeup
              </Link>
              
              {/* Mobile Auth Links */}
              {!user && (
                <>
                  <div className="border-t border-border pt-4 mt-2">
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false)
                        setAuthModalOpen(true)
                      }}
                      className="w-full text-left text-sm font-medium text-foreground transition-colors hover:text-primary"
                    >
                      Login / Sign Up
                    </button>
                  </div>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        message={authMessage}
      />
    </header>
  )
}
