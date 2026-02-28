# Manuva Backend API

Backend API for Manuva - A handmade marketplace platform connecting artisans with customers.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- PostgreSQL (v12+) with database `manuva-v`
- Your database should already have the schema installed

### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Configure environment**
The `.env` file is already configured with:
```
DB_NAME=manuva-v
DB_PASSWORD=aya
```

3. **Check database and seed initial data**
```bash
npm run init-db
```

This will:
- Check your existing database tables
- Insert default categories if needed
- Insert subscription plans if needed

4. **Start the server**
```bash
npm start
```

Or with auto-reload for development:
```bash
npm run dev
```

The server runs on `http://localhost:3000`

## 📋 Database Schema

Your database includes:
- **users** - UUID-based with roles (customer, artisan, admin)
- **products** - With image URLs, approval system, and sold tracking
- **categories** - Product categories
- **orders** - With platform fees and seller payouts
- **order_items** - Automatic stock updates via trigger
- **reviews** - Product ratings (1-5 stars)
- **favorites** - User favorite products
- **follows** - Users following artisans
- **subscription_plans** - Premium seller subscriptions
- **seller_subscriptions** - Active subscriptions

## 🔑 Key Features

✅ **UUID Primary Keys** - Secure, non-sequential IDs
✅ **Role-Based Access** - Customer, Artisan, Admin roles
✅ **Product Approval System** - Admin approval required
✅ **Automatic Stock Management** - Database triggers handle stock
✅ **Platform Fees** - 5% commission calculated automatically
✅ **Subscription System** - Free and Premium plans
✅ **Image Storage** - Firebase-ready image URL support
✅ **Review System** - Verified purchase reviews
✅ **Favorites & Following** - Social features

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register          - Register (customer/artisan)
POST   /api/auth/login             - Login
GET    /api/auth/me                - Get current user
PATCH  /api/auth/profile           - Update profile
POST   /api/auth/change-password   - Change password
```

### Products
```
GET    /api/products               - Get products (with filters)
GET    /api/products/:id           - Get single product
POST   /api/products               - Create product (artisan)
PATCH  /api/products/:id           - Update product (artisan)
DELETE /api/products/:id           - Delete product (artisan)
GET    /api/products/featured/list - Get featured products
PATCH  /api/products/:id/approve   - Approve/reject (admin)
```

### Categories
```
GET    /api/categories             - Get all categories
GET    /api/categories/:id         - Get single category
```

### Orders
```
POST   /api/orders                 - Create order
GET    /api/orders                 - Get user orders
GET    /api/orders/:id             - Get single order
PATCH  /api/orders/:id/status      - Update order status
PATCH  /api/orders/:id/payment     - Update payment status
GET    /api/orders/seller/orders   - Get seller orders (artisan)
```

### Reviews
```
GET    /api/reviews/product/:id    - Get product reviews
POST   /api/reviews                - Create review
PATCH  /api/reviews/:id            - Update review
DELETE /api/reviews/:id            - Delete review
```

### User (Favorites & Following)
```
GET    /api/user/favorites                  - Get favorites
POST   /api/user/favorites/:productId       - Add to favorites
DELETE /api/user/favorites/:productId       - Remove from favorites
GET    /api/user/favorites/:productId/check - Check if favorited

GET    /api/user/following                  - Get followed artisans
POST   /api/user/following/:sellerId        - Follow artisan
DELETE /api/user/following/:sellerId        - Unfollow artisan
GET    /api/user/following/:sellerId/check  - Check if following
```

### Artisans
```
GET    /api/artisans                        - Get all artisans
GET    /api/artisans/:id                    - Get single artisan
GET    /api/artisans/:id/products           - Get artisan products
GET    /api/artisans/dashboard/analytics    - Get analytics (artisan)
GET    /api/artisans/dashboard/pending-products - Get pending products (artisan)
```

## 🔍 Query Parameters

### Products
- `category_id` - Filter by category (UUID)
- `seller_id` - Filter by seller (UUID)
- `search` - Search in name/description
- `material`, `theme`, `color`, `size` - Filter by attributes
- `min_price`, `max_price` - Price range
- `status` - approved/pending/rejected (default: approved)
- `is_featured` - true/false
- `sort_by` - created_at/price/sold/name
- `order` - ASC/DESC
- `page`, `limit` - Pagination

### Orders
- `status` - pending/confirmed/shipped/delivered/cancelled
- `page`, `limit` - Pagination

## 🔐 Authentication

Include JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

Get token from:
- POST `/api/auth/register`
- POST `/api/auth/login`

## 💰 Monetization Features

### Platform Fees
- Automatically calculated at 5% of order total
- `platform_fee` and `seller_payout` fields in orders table

### Subscription Plans
Three tiers included:
1. **Free Plan** - Basic features
2. **Premium Monthly** - 2999 DZD/month
3. **Premium Yearly** - 29990 DZD/year (20% discount)

Benefits include:
- Featured listings
- Advanced analytics
- Priority support

## 🎨 Product Approval Workflow

1. Artisan creates product → Status: `pending`
2. Admin reviews product
3. Admin approves/rejects → Status: `approved` or `rejected`
4. Only approved products shown to customers

## 📦 Order Flow

1. Customer adds products to cart (frontend)
2. Customer creates order → Status: `pending`, Payment: `pending`
3. **Stock automatically decreases** (database trigger)
4. **Sold count increases** (database trigger)
5. Platform fee calculated (5%)
6. Payment processed → Payment status: `paid`
7. Order fulfillment → Status updates: confirmed → shipped → delivered

## 🛡️ Database Triggers

Automatic processes:
- ✅ Stock reduction on order
- ✅ Sold count increment
- ✅ Updated_at timestamp updates
- ✅ New product notifications

## 🎯 Example Usage

### Register an Artisan
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "artisan@example.com",
    "password": "password123",
    "name": "Ahmed Benali",
    "role": "artisan",
    "bio": "Traditional pottery maker",
    "location": "Algiers, Algeria"
  }'
```

### Create a Product (Artisan)
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Handmade Ceramic Vase",
    "description": "Beautiful traditional vase",
    "price": 3500,
    "stock": 10,
    "category_id": "uuid-here",
    "material": "Ceramic",
    "theme": "Traditional",
    "image_url": "https://firebase.storage.../vase.jpg"
  }'
```

### Approve Product (Admin)
```bash
curl -X PATCH http://localhost:3000/api/products/PRODUCT_ID/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"status": "approved"}'
```

### Create Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "items": [{"product_id": "uuid-here", "quantity": 2}],
    "shipping_address": {
      "address": "123 Main St",
      "city": "Algiers",
      "postal_code": "16000",
      "country": "Algeria"
    },
    "payment_method": "credit_card"
  }'
```

## 🔧 Development Tips

### Database Reset (if needed)
```sql
-- Connect to PostgreSQL
psql -U postgres -d manuva-v

-- Check tables
\dt

-- View data
SELECT * FROM users;
SELECT * FROM products WHERE status = 'pending';
```

### Common Issues

**Error: relation "users" does not exist**
- Your database schema isn't installed
- Run your SQL schema file first

**Error: column "first_name" does not exist**
- Old code referencing wrong schema
- This backend is updated for your schema

**Stock not decreasing**
- Check trigger: `trg_stock_after_order`
- Verify it's active: `\df` in psql

## 📊 Analytics Features

Artisans can access:
- Total products, sales, revenue
- Follower count
- Average rating
- Recent orders
- Top-selling products
- Monthly revenue trends
- Pending products awaiting approval

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT authentication
- UUID primary keys (non-sequential)
- SQL injection protection
- Role-based access control
- Account deactivation support
- CORS enabled

## 📝 Default Data

### Categories
8 default categories:
- Pottery & Ceramics
- Textiles & Fabrics
- Jewelry & Accessories
- Home Decor
- Art & Paintings
- Leather Goods
- Wood Crafts
- Metal Works

### Subscription Plans
3 default plans:
- Free Plan (0 DZD)
- Premium Monthly (2999 DZD)
- Premium Yearly (29990 DZD)

## 🚀 Production Deployment

Before deploying:
1. Change `JWT_SECRET` in .env
2. Set `NODE_ENV=production`
3. Enable HTTPS
4. Set up proper CORS origins
5. Configure backup for PostgreSQL
6. Set up monitoring

## 📞 Support

For issues:
1. Check console logs
2. Verify database connection
3. Ensure schema is installed
4. Review API_EXAMPLES.md

## 📄 License

MIT

---

**Built for Manuva - Empowering Algerian Artisans** 🇩🇿
