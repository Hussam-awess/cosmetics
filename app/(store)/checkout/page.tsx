'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ShoppingBag, Loader2 } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { formatPrice, generateOrderNumber } from '@/lib/format'
import { createClient } from '@/lib/supabase/client'
import { ManualPaymentGuide } from '@/components/checkout/manual-payment-guide'

const SHIPPING_FEE = 5000

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, clearCart } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    shipping_address: '',
    city: 'Dar es Salaam',
    payment_method: 'mpesa' as 'mpesa' | 'tigopesa' | 'cash_on_delivery',
    notes: '',
  })
  const [paymentConfirmed, setPaymentConfirmed] = useState(false)

  const total = subtotal + SHIPPING_FEE

  // Reset payment confirmation when payment method changes
  const handlePaymentMethodChange = (method: typeof formData.payment_method) => {
    setFormData(d => ({ ...d, payment_method: method }))
    setPaymentConfirmed(false)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    // Check if payment is required and not confirmed
    if ((formData.payment_method === 'mpesa' || formData.payment_method === 'tigopesa') && !paymentConfirmed) {
      setError('Please complete the payment using the payment guide before placing your order.')
      setIsSubmitting(false)
      return
    }

    try {
      const supabase = createClient()
      const orderNumber = generateOrderNumber()

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_name: formData.customer_name,
          customer_email: formData.customer_email,
          customer_phone: formData.customer_phone,
          shipping_address: formData.shipping_address,
          city: formData.city,
          payment_method: formData.payment_method,
          subtotal: subtotal,
          shipping_fee: SHIPPING_FEE,
          total: total,
          notes: formData.notes || null,
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: item.product.price,
        total_price: item.product.price * item.quantity,
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // Clear cart and redirect to success page
      clearCart()
      router.push(`/checkout/success?order=${orderNumber}`)
    } catch (err) {
      console.error('Checkout error:', err)
      setError('Failed to place order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto max-w-md">
          <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground/30" />
          <h1 className="mt-4 text-2xl font-semibold text-foreground">
            Your cart is empty
          </h1>
          <p className="mt-2 text-muted-foreground">
            Add some products to your cart before checking out.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Continue shopping
        </Link>

        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-foreground">
          Checkout
        </h1>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-2">
          {/* Checkout Form */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground">
                Contact Information
              </h2>
              <div className="mt-4 grid gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.customer_name}
                    onChange={e => setFormData(d => ({ ...d, customer_name: e.target.value }))}
                    className="mt-1 block w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.customer_email}
                    onChange={e => setFormData(d => ({ ...d, customer_email: e.target.value }))}
                    className="mt-1 block w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-foreground">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    required
                    value={formData.customer_phone}
                    onChange={e => setFormData(d => ({ ...d, customer_phone: e.target.value }))}
                    className="mt-1 block w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="+255 XXX XXX XXX"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground">
                Shipping Address
              </h2>
              <div className="mt-4 grid gap-4">
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-foreground">
                    Street Address
                  </label>
                  <textarea
                    id="address"
                    required
                    rows={2}
                    value={formData.shipping_address}
                    onChange={e => setFormData(d => ({ ...d, shipping_address: e.target.value }))}
                    className="mt-1 block w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                    placeholder="Enter your street address"
                  />
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-foreground">
                    City
                  </label>
                  <select
                    id="city"
                    value={formData.city}
                    onChange={e => setFormData(d => ({ ...d, city: e.target.value }))}
                    className="mt-1 block w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="Dar es Salaam">Dar es Salaam</option>
                    <option value="Arusha">Arusha</option>
                    <option value="Dodoma">Dodoma</option>
                    <option value="Mwanza">Mwanza</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground">
                Payment Method
              </h2>
              <div className="mt-4 space-y-3">
                {[
                  { value: 'mpesa', label: 'M-Pesa', desc: 'Pay with Vodacom M-Pesa' },
                  { value: 'tigopesa', label: 'Tigo Pesa', desc: 'Pay with Tigo Pesa' },
                  { value: 'cash_on_delivery', label: 'Cash on Delivery', desc: 'Pay when you receive' },
                ].map(method => (
                  <label
                    key={method.value}
                    className={`flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-colors ${
                      formData.payment_method === method.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value={method.value}
                      checked={formData.payment_method === method.value}
                      onChange={e => handlePaymentMethodChange(e.target.value as typeof formData.payment_method)}
                      className="h-4 w-4 text-primary focus:ring-primary"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-foreground">{method.label}</span>
                      <p className="text-sm text-muted-foreground">{method.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              {/* Manual Payment Guide for M-Pesa and Tigo Pesa */}
              {(formData.payment_method === 'mpesa' || formData.payment_method === 'tigopesa') && (
                <div className="mt-4 pt-4 border-t border-border">
                  {/* Payment Status */}
                  <div className="mb-4 p-3 rounded-lg border bg-muted/50">
                    <div className="flex items-center gap-2">
                      {paymentConfirmed ? (
                        <>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium text-green-700">
                            Payment confirmed - You can place your order
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <span className="text-sm font-medium text-orange-700">
                            Payment required - Complete payment before placing order
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <ManualPaymentGuide
                    paymentMethod={formData.payment_method}
                    amount={total}
                    onPaymentConfirmed={() => {
                      // User confirmed they've paid, set payment confirmed and submit order
                      setPaymentConfirmed(true)
                      handleSubmit(new Event('submit') as any)
                    }}
                  />
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground">
                Order Notes (Optional)
              </h2>
              <textarea
                value={formData.notes}
                onChange={e => setFormData(d => ({ ...d, notes: e.target.value }))}
                rows={3}
                className="mt-4 block w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                placeholder="Any special instructions for your order..."
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground">
                Order Summary
              </h2>

              {/* Items */}
              <ul className="mt-4 divide-y divide-border">
                {items.map(item => (
                  <li key={item.product.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                      {item.product.image_url ? (
                        <Image
                          src={item.product.image_url}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col">
                      <span className="text-sm font-medium text-foreground">
                        {item.product.name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Qty: {item.quantity}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Totals */}
              <div className="mt-6 border-t border-border pt-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-foreground">{formatPrice(SHIPPING_FEE)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-3">
                  <span className="text-lg font-semibold text-foreground">Total</span>
                  <span className="text-lg font-semibold text-primary">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Place Order'
                )}
              </button>

              <p className="mt-4 text-center text-xs text-muted-foreground">
                By placing this order, you agree to our terms and conditions.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
