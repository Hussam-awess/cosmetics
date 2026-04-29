import { createClient } from '@/lib/supabase/server'
import { formatPrice, formatDate } from '@/lib/format'
import { Package, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Fetch stats
  const [
    { count: totalProducts },
    { count: totalOrders },
    { data: orders },
    { data: recentOrders }
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('active', true),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('total, payment_status'),
    supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5)
  ])

  const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total), 0) || 0
  const paidOrders = orders?.filter(o => o.payment_status === 'paid').length || 0
  const pendingOrders = orders?.filter(o => o.payment_status === 'pending').length || 0

  const stats = [
    {
      label: 'Total Products',
      value: totalProducts || 0,
      icon: Package,
      color: 'bg-blue-500/10 text-blue-600',
    },
    {
      label: 'Total Orders',
      value: totalOrders || 0,
      icon: ShoppingCart,
      color: 'bg-green-500/10 text-green-600',
    },
    {
      label: 'Total Revenue',
      value: formatPrice(totalRevenue),
      icon: DollarSign,
      color: 'bg-primary/10 text-primary',
    },
    {
      label: 'Paid Orders',
      value: paidOrders,
      icon: TrendingUp,
      color: 'bg-amber-500/10 text-amber-600',
    },
  ]

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to Niffer Cosmetics admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(stat => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Status Overview */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Order Status</h2>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pending Payment</span>
              <span className="rounded-full bg-amber-500/10 px-3 py-1 text-sm font-medium text-amber-600">
                {pendingOrders}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Paid</span>
              <span className="rounded-full bg-green-500/10 px-3 py-1 text-sm font-medium text-green-600">
                {paidOrders}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Orders</span>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                {totalOrders || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
          <div className="mt-4 grid gap-3">
            <Link
              href="/admin/orders"
              className="flex items-center gap-3 rounded-lg border border-border p-4 hover:bg-muted transition-colors"
            >
              <ShoppingCart className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">View All Orders</p>
                <p className="text-sm text-muted-foreground">Manage and process orders</p>
              </div>
            </Link>
            <Link
              href="/admin/products"
              className="flex items-center gap-3 rounded-lg border border-border p-4 hover:bg-muted transition-colors"
            >
              <Package className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">Manage Products</p>
                <p className="text-sm text-muted-foreground">Add, edit, or remove products</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="mt-8 rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-6">
          <h2 className="text-lg font-semibold text-foreground">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Customer
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
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentOrders?.map(order => (
                <tr key={order.id} className="hover:bg-muted/50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <Link href={`/admin/orders/${order.id}`} className="font-medium text-foreground hover:text-primary">
                      {order.order_number}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                    {order.customer_name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <OrderStatusBadge status={order.order_status} />
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground">
                    {formatPrice(order.total)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                    {formatDate(order.created_at)}
                  </td>
                </tr>
              ))}
              {(!recentOrders || recentOrders.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No orders yet
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

function OrderStatusBadge({ status }: { status: string }) {
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
