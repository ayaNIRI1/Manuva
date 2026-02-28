# Manuva API Testing Examples

This file contains example requests you can use to test the API using tools like Postman, Insomnia, or curl.

## 1. Register a Buyer

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "buyer@example.com",
    "password": "password123",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+213555123456",
    "role": "buyer"
  }'
```

## 2. Register a Seller

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seller@example.com",
    "password": "password123",
    "first_name": "Alice",
    "last_name": "Smith",
    "phone": "+213555987654",
    "role": "seller",
    "shop_name": "Alice Handmade",
    "shop_description": "Beautiful handcrafted items"
  }'
```

## 3. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seller@example.com",
    "password": "password123"
  }'
```

Response will include a JWT token. Save this token for authenticated requests.

## 4. Create a Product (Seller)

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Handmade Ceramic Vase",
    "description": "Beautiful handcrafted ceramic vase with traditional Algerian patterns",
    "price": 2500.00,
    "stock_quantity": 10,
    "category_id": 1,
    "material": "Ceramic",
    "theme": "Traditional",
    "style": "Algerian",
    "images": [
      "https://example.com/vase1.jpg",
      "https://example.com/vase2.jpg"
    ]
  }'
```

## 5. Get All Products

```bash
curl http://localhost:3000/api/products
```

With filters:
```bash
curl "http://localhost:3000/api/products?category_id=1&min_price=1000&max_price=5000&sort_by=price&order=ASC"
```

## 6. Search Products

```bash
curl "http://localhost:3000/api/products?search=ceramic&material=clay"
```

## 7. Get Single Product

```bash
curl http://localhost:3000/api/products/1
```

## 8. Update Product (Seller)

```bash
curl -X PATCH http://localhost:3000/api/products/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "price": 2800.00,
    "stock_quantity": 15
  }'
```

## 9. Get Categories

```bash
curl http://localhost:3000/api/categories
```

## 10. Add to Favorites

```bash
curl -X POST http://localhost:3000/api/user/favorites/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 11. Get User Favorites

```bash
curl http://localhost:3000/api/user/favorites \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 12. Follow Seller

```bash
curl -X POST http://localhost:3000/api/user/following/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 13. Create Order

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "items": [
      {
        "product_id": 1,
        "quantity": 2
      }
    ],
    "shipping_address": "123 Main St, Apartment 4B",
    "shipping_city": "Algiers",
    "shipping_postal_code": "16000",
    "shipping_country": "Algeria",
    "payment_method": "cash_on_delivery",
    "notes": "Please call before delivery"
  }'
```

## 14. Get User Orders

```bash
curl http://localhost:3000/api/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Filter by status:
```bash
curl "http://localhost:3000/api/orders?status=pending" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 15. Create Review

```bash
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "product_id": 1,
    "order_id": 1,
    "rating": 5,
    "comment": "Excellent quality! Exactly as described."
  }'
```

## 16. Get Product Reviews

```bash
curl http://localhost:3000/api/reviews/product/1
```

## 17. Get Seller Profile

```bash
curl http://localhost:3000/api/sellers/1
```

## 18. Get Seller Products

```bash
curl http://localhost:3000/api/sellers/1/products
```

## 19. Update Seller Profile (Seller)

```bash
curl -X PATCH http://localhost:3000/api/sellers/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "shop_name": "Alice Premium Crafts",
    "shop_description": "Premium handmade items with love and care"
  }'
```

## 20. Get Seller Analytics (Seller)

```bash
curl http://localhost:3000/api/sellers/analytics/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 21. Get Current User

```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 22. Update User Profile

```bash
curl -X PATCH http://localhost:3000/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "first_name": "John",
    "last_name": "Doe Updated",
    "phone": "+213555999888"
  }'
```

## 23. Get Featured Products

```bash
curl http://localhost:3000/api/products/featured/list
```

## 24. Check if Product is Favorited

```bash
curl http://localhost:3000/api/user/favorites/1/check \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 25. Get All Sellers

```bash
curl http://localhost:3000/api/sellers
```

With search:
```bash
curl "http://localhost:3000/api/sellers?search=alice"
```

## Notes

- Replace `YOUR_JWT_TOKEN` with the actual token received from login
- Replace product IDs, seller IDs, etc. with actual IDs from your database
- Default port is 3000, adjust if you changed it in .env
- All authenticated endpoints require the Authorization header
