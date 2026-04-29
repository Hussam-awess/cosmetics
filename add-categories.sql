-- Add default categories for Niffer Cosmetics
-- Run this in your Supabase SQL Editor

INSERT INTO categories (name, slug, description) VALUES
('Skincare', 'skincare', 'Premium skincare products for healthy, glowing skin'),
('Makeup', 'makeup', 'Professional makeup products for all occasions'),
('Fragrance', 'fragrance', 'Luxury perfumes and fragrances for men and women'),
('Body Care', 'body-care', 'Nourishing body care products and treatments'),
('Hair Care', 'hair-care', 'Premium hair care products for all hair types'),
('Face', 'face', 'Specialized face treatments and cosmetics'),
('Lips', 'lips', 'Lip care products and cosmetics'),
('Eyes', 'eyes', 'Eye makeup and care products'),
('Tools & Accessories', 'tools-accessories', 'Professional beauty tools and accessories')
ON CONFLICT (slug) DO NOTHING;
