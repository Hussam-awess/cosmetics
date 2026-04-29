'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Order } from '@/lib/types'

interface OrderStatusUpdaterProps {
  order: Order
}

const orderStatuses = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
] as const

const paymentStatuses = ['pending', 'paid', 'failed'] as const

export function OrderStatusUpdater({ order }: OrderStatusUpdaterProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [orderStatus, setOrderStatus] = useState(order.order_status)
  const [paymentStatus, setPaymentStatus] = useState(order.payment_status)

  const handleUpdate = async () => {
    const supabase = createClient()

    const { error } = await supabase
      .from('orders')
      .update({
        order_status: orderStatus,
        payment_status: paymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id)

    if (!error) {
      startTransition(() => {
        router.refresh()
      })
    }
  }

  const hasChanges = orderStatus !== order.order_status || paymentStatus !== order.payment_status

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Order Status
        </label>
        <select
          value={orderStatus}
          onChange={e => setOrderStatus(e.target.value as Order['order_status'])}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {orderStatuses.map(status => (
            <option key={status} value={status} className="capitalize">
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Payment Status
        </label>
        <select
          value={paymentStatus}
          onChange={e => setPaymentStatus(e.target.value as Order['payment_status'])}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {paymentStatuses.map(status => (
            <option key={status} value={status} className="capitalize">
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleUpdate}
        disabled={!hasChanges || isPending}
        className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Updating...
          </>
        ) : (
          'Update Status'
        )}
      </button>
    </div>
  )
}
