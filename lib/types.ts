export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  created_at: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  compare_at_price: number | null
  category_id: string | null
  image_url: string | null
  stock: number
  featured: boolean
  active: boolean
  created_at: string
  updated_at: string
  category?: Category
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone: string
  shipping_address: string
  city: string
  payment_method: 'mpesa' | 'tigopesa' | 'cash_on_delivery'
  payment_status: 'pending' | 'paid' | 'failed'
  order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  subtotal: number
  shipping_fee: number
  total: number
  notes: string | null
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
}

export interface AdminUser {
  id: string
  email: string
  role: 'admin' | 'super_admin'
  created_at: string
}
