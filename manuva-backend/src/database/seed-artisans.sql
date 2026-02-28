-- Seeding script for testing the seller profile
-- This script adds a test artisan, some products, and reviews

-- 1. Create a test artisan (password is 'password123' hashed with bcrypt)
-- Using gen_random_uuid() for IDs to avoid conflicts
INSERT INTO users (id, name, email, password, role, bio, location, is_active, is_verified)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000', 
    'Ahmed Artisan', 
    'artisan@example.com', 
    '$2a$10$G4LLR3pfVjLJIaAfcHzmq.3bwWrB7PVJxQ/jz0c6.vLUbetOzQKVW', -- correct bcrypt for 'password123'
    'artisan', 
    'I craft high-quality traditional Algerian pottery using ancient techniques passed down through generations.', 
    'Algiers, Algeria', 
    true, 
    true
) ON CONFLICT (email) DO NOTHING;

-- 2. Add products for the artisan
INSERT INTO products (seller_id, category_id, name, description, price, stock, material, image_url, status)
SELECT 
    '550e8400-e29b-41d4-a716-446655440000',
    id,
    'Traditional Ceramic Vase',
    'A beautiful handmade ceramic vase with intricate patterns.',
    2500.00,
    10,
    'Ceramic',
    'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=400',
    'approved'
FROM categories WHERE name = 'Pottery' LIMIT 1;

INSERT INTO products (seller_id, category_id, name, description, price, stock, material, image_url, status)
SELECT 
    '550e8400-e29b-41d4-a716-446655440000',
    id,
    'Handmade Silver Ring',
    'Authentic handmade silver ring with traditional engravings.',
    5000.00,
    5,
    'Silver',
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=400',
    'approved'
FROM categories WHERE name = 'Jewelry' LIMIT 1;

-- 4. Create a test buyer
INSERT INTO users (id, name, email, password, role, is_active)
VALUES (
    '660e8400-e29b-41d4-a716-446655440000',
    'Test Buyer',
    'buyer@example.com',
    '$2b$10$EPfLrkZh68L56Enw8V6uO.fH1vjV8Wn.e.vV.vV.vV.vV.vV.vV.v',
    'customer',
    true
) ON CONFLICT (email) DO NOTHING;

-- 5. Add reviews
INSERT INTO reviews (product_id, buyer_id, rating, comment)
SELECT 
    p.id,
    '660e8400-e29b-41d4-a716-446655440000',
    5,
    'Absolutely stunning craftsmanship! It looks even better in person.'
FROM products p
WHERE p.seller_id = '550e8400-e29b-41d4-a716-446655440000' AND p.name = 'Traditional Ceramic Vase'
ON CONFLICT (product_id, buyer_id) DO NOTHING;
