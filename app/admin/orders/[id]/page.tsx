import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatPrice, formatDate } from '@/lib/format'
import Link from 'next/link'
import { ArrowLeft, MapPin, Phone, Mail, CreditCard } from 'lucide-react'
import { OrderStatusUpdater } from '@/components/admin/order-status-updater'

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (!order) {
    notFound()
  }

  const { data: items } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', id)

  const paymentMethodLabels: Record<string, string> = {
    mpesa: 'M-Pesa',
    tigopesa: 'Tigo Pesa',
    cash_on_delivery: 'Cash on Delivery',
  }

  return (
    <div className="p-6 lg:p-8">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Orders
      </Link>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Order {order.order_number}
          </h1>
          <p className="text-muted-foreground">
            Placed on {formatDate(order.created_at)}
          </p>
        </div>
        <OrderStatusUpdater order={order} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Order Items */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card">
          <div className="border-b border-border p-6">
            <h2 className="text-lg font-semibold text-foreground">Order Items</h2>
          </div>
          <div className="divide-y divide-border">
            {items?.map(item => (
              <div key={item.id} className="flex items-center justify-between p-6">
                <div>
                  <p className="font-medium text-foreground">{item.product_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(item.unit_price)} x {item.quantity}
                  </p>
                </div>
                <p className="font-medium text-foreground">
                  {formatPrice(item.total_price)}
                </p>
              </div>
            ))}
          </div>
          <div className="border-t border-border p-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span className="text-foreground">{formatPrice(order.shipping_fee)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2">
              <span className="font-semibold text-foreground">Total</span>
              <span className="font-semibold text-primary">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold text-foreground">Customer</h3>
            <div className="mt-4 space-y-3">
              <p className="text-sm font-medium text-foreground">{order.customer_name}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                {order.customer_email}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                {order.customer_phone}
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold text-foreground">Shipping Address</h3>
            <div className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p>{order.shipping_address}</p>
                <p>{order.city}</p>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold text-foreground">Payment</h3>
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{paymentMethodLabels[order.payment_method]}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Status:</span>
                <PaymentStatusBadge status={order.payment_status} />
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-semibold text-foreground">Order Notes</h3>
              <p className="mt-2 text-sm text-muted-foreground">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function PaymentStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-600',
    paid: 'bg-green-500/10 text-green-600',
    failed: 'bg-red-500/10 text-red-600',
  }

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${styles[status]}`}>
      {status}
    </span>
  )
}
