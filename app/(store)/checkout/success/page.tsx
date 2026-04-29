import Link from 'next/link'
import { CheckCircle, ArrowRight, Phone } from 'lucide-react'

interface SuccessPageProps {
  searchParams: Promise<{ order?: string }>
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams
  const orderNumber = params.order

  return (
    <div className="py-16 lg:py-24">
      <div className="mx-auto max-w-lg px-4 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>

        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-foreground">
          Order Placed Successfully!
        </h1>

        {orderNumber && (
          <div className="mt-4">
            <span className="text-muted-foreground">Order Number: </span>
            <span className="font-mono font-semibold text-primary">{orderNumber}</span>
          </div>
        )}

        <p className="mt-4 text-muted-foreground">
          Thank you for shopping with Niffer Cosmetics! We&apos;ve received your order and 
          will process it shortly. You&apos;ll receive a confirmation message on your phone.
        </p>

        <div className="mt-8 rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">What&apos;s Next?</h2>
          <ul className="mt-4 space-y-3 text-left text-sm text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">1</span>
              <span>Our team will verify your order and payment details</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">2</span>
              <span>You&apos;ll receive a call to confirm your delivery address</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">3</span>
              <span>Your order will be delivered within 2-3 business days</span>
            </li>
          </ul>
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Continue Shopping
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="tel:+255123456789"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-6 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <Phone className="h-4 w-4" />
            Contact Us
          </a>
        </div>
      </div>
    </div>
  )
}
