import { createClient } from '@/lib/supabase/server'
import { formatPrice, formatDate } from '@/lib/format'
import Link from 'next/link'
import { Eye } from 'lucide-react'

export default async function OrdersPage() {
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Orders</h1>
        <p className="text-muted-foreground">Manage and process customer orders</p>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders?.map(order => (
                <tr key={order.id} className="hover:bg-muted/30">
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="font-mono text-sm font-medium text-foreground">
                      {order.order_number}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">{order.customer_name}</p>
                      <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                    {order.customer_phone}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <PaymentBadge status={order.payment_status} method={order.payment_method} />
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <StatusBadge status={order.order_status} />
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground">
                    {formatPrice(order.total)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {(!orders || orders.length === 0) && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-600',
    confirmed: 'bg-blue-500/10 text-blue-600',
    processing: 'bg-purple-500/10 text-purple-600',
    shipped: 'bg-cyan-500/10 text-cyan-600',
    delivered: 'bg-green-500/10 text-green-600',
    cancelled: 'bg-red-500/10 text-red-600',
  }

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${styles[status] || 'bg-muted text-muted-foreground'}`}>
      {status}
    </span>
  )
}

function PaymentBadge({ status, method }: { status: string; method: string }) {
  const statusStyles: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-600',
    paid: 'bg-green-500/10 text-green-600',
    failed: 'bg-red-500/10 text-red-600',
  }

  const methodLabels: Record<string, string> = {
    mpesa: 'M-Pesa',
    tigopesa: 'Tigo Pesa',
    cash_on_delivery: 'COD',
  }

  return (
    <div className="flex flex-col gap-1">
      <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusStyles[status]}`}>
        {status}
      </span>
      <span className="text-xs text-muted-foreground">{methodLabels[method] || method}</span>
    </div>
  )
}
