-- Create categories table for Niffer Cosmetics
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS (Row Level Security)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read categories
CREATE POLICY "Categories are viewable by authenticated users" ON categories
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy for authenticated users to insert categories
CREATE POLICY "Authenticated users can insert categories" ON categories
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policy for authenticated users to update categories
CREATE POLICY "Authenticated users can update categories" ON categories
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Create policy for authenticated users to delete categories
CREATE POLICY "Authenticated users can delete categories" ON categories
  FOR DELETE USING (auth.role() = 'authenticated');

-- Insert some default categories
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
('Men\'s Grooming', 'mens-grooming', 'Grooming products specifically for men'),
('Natural & Organic', 'natural-organic', 'Natural and organic beauty products'),
('Anti-Aging', 'anti-aging', 'Products targeting anti-aging concerns'),
('Sun Care', 'sun-care', 'Sun protection and after-sun care')
ON CONFLICT (slug) DO NOTHING;
