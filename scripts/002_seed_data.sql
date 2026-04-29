-- Seed categories
INSERT INTO categories (name, slug, description) VALUES
  ('Skincare', 'skincare', 'Premium skincare products for radiant, healthy skin'),
  ('Fragrance', 'fragrance', 'Luxurious perfumes and body mists'),
  ('Makeup', 'makeup', 'Professional makeup for every occasion')
ON CONFLICT (slug) DO NOTHING;

-- Seed products
INSERT INTO products (name, slug, description, price, compare_at_price, category_id, image_url, stock, featured) VALUES
  -- Skincare
  ('Radiance Glow Serum', 'radiance-glow-serum', 'A lightweight vitamin C serum that brightens and evens skin tone. Perfect for daily use.', 45000, 55000, (SELECT id FROM categories WHERE slug = 'skincare'), 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500', 50, true),
  ('Hydrating Rose Moisturizer', 'hydrating-rose-moisturizer', 'Deep hydration with rose hip oil and hyaluronic acid. Leaves skin soft and supple.', 38000, NULL, (SELECT id FROM categories WHERE slug = 'skincare'), 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=500', 35, true),
  ('Gentle Cleansing Milk', 'gentle-cleansing-milk', 'Removes makeup and impurities without stripping natural oils. Suitable for all skin types.', 25000, NULL, (SELECT id FROM categories WHERE slug = 'skincare'), 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500', 60, false),
  ('Anti-Aging Night Cream', 'anti-aging-night-cream', 'Powerful retinol formula that reduces fine lines while you sleep.', 65000, 75000, (SELECT id FROM categories WHERE slug = 'skincare'), 'https://images.unsplash.com/photo-1570194065650-d99fb4b38b17?w=500', 25, true),
  ('Exfoliating Face Scrub', 'exfoliating-face-scrub', 'Gentle micro-beads remove dead skin cells for a brighter complexion.', 22000, NULL, (SELECT id FROM categories WHERE slug = 'skincare'), 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=500', 40, false),
  
  -- Fragrance
  ('Rose Oud Parfum', 'rose-oud-parfum', 'An intoxicating blend of Bulgarian rose and Arabian oud. Long-lasting elegance.', 120000, 150000, (SELECT id FROM categories WHERE slug = 'fragrance'), 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=500', 20, true),
  ('Fresh Citrus Body Mist', 'fresh-citrus-body-mist', 'Light and refreshing citrus notes perfect for everyday wear.', 28000, NULL, (SELECT id FROM categories WHERE slug = 'fragrance'), 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=500', 45, false),
  ('Vanilla Dreams Perfume', 'vanilla-dreams-perfume', 'Warm vanilla and sandalwood create a cozy, feminine scent.', 85000, NULL, (SELECT id FROM categories WHERE slug = 'fragrance'), 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=500', 30, true),
  ('Ocean Breeze EDT', 'ocean-breeze-edt', 'Fresh marine notes with hints of white tea. Perfect for hot days.', 55000, NULL, (SELECT id FROM categories WHERE slug = 'fragrance'), 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=500', 35, false),
  
  -- Makeup
  ('Velvet Matte Lipstick Set', 'velvet-matte-lipstick-set', 'Set of 6 long-wearing matte lipsticks in stunning shades. Highly pigmented.', 48000, 60000, (SELECT id FROM categories WHERE slug = 'makeup'), 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500', 40, true),
  ('Flawless Foundation SPF 30', 'flawless-foundation-spf30', 'Buildable coverage with sun protection. Available in 12 shades.', 42000, NULL, (SELECT id FROM categories WHERE slug = 'makeup'), 'https://images.unsplash.com/photo-1631214540553-ff044a3ff1d4?w=500', 55, true),
  ('Smoky Eye Palette', 'smoky-eye-palette', '12 richly pigmented eyeshadows for creating day-to-night looks.', 55000, 65000, (SELECT id FROM categories WHERE slug = 'makeup'), 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500', 30, true),
  ('Volumizing Mascara', 'volumizing-mascara', 'Dramatic volume and length without clumping. Smudge-proof formula.', 18000, NULL, (SELECT id FROM categories WHERE slug = 'makeup'), 'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=500', 70, false),
  ('Setting Spray Mist', 'setting-spray-mist', 'Lock in your makeup for up to 16 hours. Refreshing micro-mist formula.', 25000, NULL, (SELECT id FROM categories WHERE slug = 'makeup'), 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500', 50, false),
  ('Brow Sculpting Kit', 'brow-sculpting-kit', 'Everything you need for perfect brows: powder, wax, and tools.', 32000, NULL, (SELECT id FROM categories WHERE slug = 'makeup'), 'https://images.unsplash.com/photo-1599733589046-10c00890b6b5?w=500', 45, false)
ON CONFLICT (slug) DO NOTHING;
