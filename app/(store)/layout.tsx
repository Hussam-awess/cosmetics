import { CartProvider } from '@/lib/cart-context'
import { AuthProvider } from '@/lib/auth-context'
import { Header } from '@/components/store/header'
import { Footer } from '@/components/store/footer'
import { CartDrawer } from '@/components/store/cart-drawer'

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
        </div>
      </CartProvider>
    </AuthProvider>
  )
}
