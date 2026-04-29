'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Database, CheckCircle, XCircle, Copy, Play } from 'lucide-react'

export function DatabaseSetupHelper() {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<string[]>([])
  const [copied, setCopied] = useState(false)

  const setupSQL = `-- Complete Database Setup for Niffer Cosmetics
-- Run this in your Supabase SQL Editor

-- ===================================
-- CATEGORIES TABLE
-- ===================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by authenticated users" ON categories
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert categories" ON categories
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update categories" ON categories
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete categories" ON categories
  FOR DELETE USING (auth.role() = 'authenticated');

-- ===================================
-- PRODUCTS TABLE
-- ===================================
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  compare_at_price DECIMAL(10,2),
  category_id UUID REFERENCES categories(id),
  image_url TEXT,
  stock INTEGER NOT NULL DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are viewable by authenticated users" ON products
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert products" ON products
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update products" ON products
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete products" ON products
  FOR DELETE USING (auth.role() = 'authenticated');

-- ===================================
-- PROFILES TABLE (for users)
-- ===================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ===================================
-- ORDERS TABLE
-- ===================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  city TEXT NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('mpesa', 'tigopesa', 'cash_on_delivery')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  order_status TEXT NOT NULL DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Orders are viewable by authenticated users" ON orders
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert orders" ON orders
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update orders" ON orders
  FOR UPDATE USING (auth.role() = 'authenticated');

-- ===================================
-- ORDER_ITEMS TABLE
-- ===================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for order_items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Order items are viewable by authenticated users" ON order_items
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert order items" ON order_items
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ===================================
-- INDEXES for performance
-- ===================================
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- ===================================
-- TRIGGERS for updated_at
-- ===================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- INSERT DEFAULT CATEGORIES
-- ===================================
INSERT INTO categories (name, slug, description) VALUES
('Skincare', 'skincare', 'Premium skincare products for healthy, glowing skin'),
('Makeup', 'makeup', 'Professional makeup products for all occasions'),
('Fragrance', 'fragrance', 'Luxury perfumes and fragrances for men and women'),
('Body Care', 'body-care', 'Nourishing body care products and treatments'),
('Hair Care', 'hair-care', 'Premium hair care products for all hair types'),
('Face', 'face', 'Specialized face treatments and cosmetics'),
('Lips', 'lips', 'Lip care products and cosmetics'),
('Eyes', 'eyes', 'Eye makeup and care products'),
('Nails', 'nails', 'Nail care products and polish'),
('Tools & Accessories', 'tools-accessories', 'Professional beauty tools and accessories'),
('Gift Sets', 'gift-sets', 'Curated gift sets for special occasions'),
('Men''s Grooming', 'mens-grooming', 'Grooming products specifically for men'),
('Natural & Organic', 'natural-organic', 'Natural and organic beauty products'),
('Anti-Aging', 'anti-aging', 'Products targeting anti-aging concerns'),
('Sun Care', 'sun-care', 'Sun protection and after-sun care')
ON CONFLICT (slug) DO NOTHING;`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(setupSQL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const verifySetup = async () => {
    setIsRunning(true)
    setResults([])

    try {
      const supabase = createClient()
      
      // Check each table
      const tables = ['categories', 'products', 'profiles', 'orders', 'order_items']
      
      for (const table of tables) {
        try {
          const { data, error, count } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true })
          
          if (error) {
            setResults(prev => [...prev, `❌ ${table}: ${error.message}`])
          } else {
            setResults(prev => [...prev, `✅ ${table}: ${count || 0} records`])
          }
        } catch (err) {
          setResults(prev => [...prev, `❌ ${table}: Table does not exist`])
        }
      }
    } catch (error) {
      setResults(prev => [...prev, `❌ Verification failed: ${error}`])
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Setup Helper
        </CardTitle>
        <CardDescription>
          Set up your Supabase database tables to fix the "Insert error" issue
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">🚨 Database Setup Required!</p>
              <p>The error "Insert error: {}" means the products table doesn't exist in your Supabase database.</p>
            </div>
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <h3 className="font-medium">Step 1: Copy SQL Script</h3>
          <Button onClick={copyToClipboard} variant="outline" className="w-full">
            {copied ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Copied to Clipboard!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy SQL Script
              </>
            )}
          </Button>
        </div>

        <div className="space-y-3">
          <h3 className="font-medium">Step 2: Run in Supabase</h3>
          <ol className="text-sm space-y-2 list-decimal list-inside bg-muted/50 p-3 rounded-lg">
            <li>Go to <strong>Supabase Dashboard</strong></li>
            <li>Navigate to <strong>SQL Editor</strong></li>
            <li>Paste the copied SQL script</li>
            <li>Click <strong>"Run"</strong> to execute</li>
            <li>Wait for completion message</li>
          </ol>
        </div>

        <div className="space-y-3">
          <h3 className="font-medium">Step 3: Verify Setup</h3>
          <Button onClick={verifySetup} disabled={isRunning} className="w-full">
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Verify Database Setup
              </>
            )}
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium">Verification Results:</h3>
            <div className="bg-muted/50 p-3 rounded-lg space-y-1">
              {results.map((result, index) => (
                <div key={index} className="text-sm font-mono">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

        {results.every(r => r.startsWith('✅')) && (
          <Alert>
            <AlertDescription className="text-green-600">
              ✅ Perfect! Database is fully set up. You can now create products without errors.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
