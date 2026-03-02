
-- Seed some products with valid UUIDs matching frontend assets (English names for encoding safety)
INSERT INTO products (id, seller_id, category_id, name, description, price, stock, status)
VALUES 
('5a2fcf2f-36f4-4ffd-84de-052161effe18', 'fdbb32ab-1636-4e9a-9edb-4a461c6035cf', '85685a64-5e1a-4ce1-9c0f-cac68c30cd3d', 'Traditional Copper Pot', 'Handmade traditional copper pot.', 6500, 100, 'approved'),
('814e8711-97e3-471a-a1db-e84bb266a6d5', 'fdbb32ab-1636-4e9a-9edb-4a461c6035cf', '85685a64-5e1a-4ce1-9c0f-cac68c30cd3d', 'Ceramic Vase', 'Beautifully hand-painted ceramic vase.', 3800, 100, 'approved'),
('c03bd0da-b04e-48ae-b776-86d07e024623', 'fdbb32ab-1636-4e9a-9edb-4a461c6035cf', 'e75590ae-0c17-4e17-9f6d-5801d8af1361', 'Berber Carpet', 'Traditional hand-woven wool carpet.', 22000, 100, 'approved'),
('11111111-1111-4111-8111-111111111114', 'fdbb32ab-1636-4e9a-9edb-4a461c6035cf', 'e75590ae-0c17-4e17-9f6d-5801d8af1361', 'Leather Bag', 'High-quality handmade leather bag.', 9500, 100, 'approved'),
('11111111-1111-4111-8111-111111111115', 'fdbb32ab-1636-4e9a-9edb-4a461c6035cf', '85685a64-5e1a-4ce1-9c0f-cac68c30cd3d', 'Decorative Plate', 'Decorative ceramic plate with traditional patterns.', 2800, 100, 'approved'),
('11111111-1111-4111-8111-111111111116', 'fdbb32ab-1636-4e9a-9edb-4a461c6035cf', 'e75590ae-0c17-4e17-9f6d-5801d8af1361', 'Silver Bracelet', 'Original silver bracelet with Amazigh patterns.', 7200, 100, 'approved'),
('11111111-1111-4111-8111-111111111117', 'fdbb32ab-1636-4e9a-9edb-4a461c6035cf', 'e75590ae-0c17-4e17-9f6d-5801d8af1361', 'Wicker Basket', 'Hand-woven natural wicker basket.', 3200, 100, 'approved'),
('11111111-1111-4111-8111-111111111118', 'fdbb32ab-1636-4e9a-9edb-4a461c6035cf', 'e75590ae-0c17-4e17-9f6d-5801d8af1361', 'Silver Necklace', 'Elegant silver necklace with turquoise stone.', 8000, 100, 'approved'),
('11111111-1111-4111-8111-111111111119', 'fdbb32ab-1636-4e9a-9edb-4a461c6035cf', 'e75590ae-0c17-4e17-9f6d-5801d8af1361', 'Wooden Mirror Frame', 'Wooden mirror frame with hand carvings.', 5500, 100, 'approved'),
('11111111-1111-4111-8111-111111111110', 'fdbb32ab-1636-4e9a-9edb-4a461c6035cf', '85685a64-5e1a-4ce1-9c0f-cac68c30cd3d', 'Pottery Coffee Cups', 'Set of 6 handmade pottery coffee cups.', 5800, 100, 'approved'),
('11111111-1111-4111-8111-111111111111', 'fdbb32ab-1636-4e9a-9edb-4a461c6035cf', 'e75590ae-0c17-4e17-9f6d-5801d8af1361', 'Wool Scarf', 'Warm wool scarf woven in traditional ways.', 4500, 100, 'approved'),
('11111111-1111-4111-8111-111111111112', 'fdbb32ab-1636-4e9a-9edb-4a461c6035cf', 'e75590ae-0c17-4e17-9f6d-5801d8af1361', 'Wooden Box', 'Small wooden box decorated with traditional patterns.', 3800, 100, 'approved')
ON CONFLICT (id) DO UPDATE SET status = 'approved', price = EXCLUDED.price, stock = EXCLUDED.stock;
