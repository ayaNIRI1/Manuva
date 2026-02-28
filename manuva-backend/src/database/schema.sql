-- ============================================
-- MANUVA DATABASE SCHEMA
-- Complete PostgreSQL Database Setup
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_id VARCHAR(255) UNIQUE,
    name VARCHAR(255) NOT NULL,
    email CITEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('customer','artisan','admin')),
    bio TEXT,
    profile_img TEXT,
    phone VARCHAR(50),
    location VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    img TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    material VARCHAR(255),
    size VARCHAR(100),
    color VARCHAR(100),
    theme VARCHAR(255),
    sold INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'pending'
        CHECK (status IN ('pending','approved','rejected')),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
    status VARCHAR(20) DEFAULT 'pending'
        CHECK (status IN ('pending','confirmed','shipped','delivered','cancelled')),
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) DEFAULT 'pending'
        CHECK (payment_status IN ('pending','paid','failed')),
    shipping_address JSONB NOT NULL,
    platform_fee DECIMAL(10,2) DEFAULT 0,
    seller_payout DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ORDER ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_purchase DECIMAL(10,2) NOT NULL CHECK (price_at_purchase >= 0),
    subtotal DECIMAL(10,2)
        GENERATED ALWAYS AS (quantity * price_at_purchase) STORED
);

-- ============================================
-- REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (product_id, buyer_id)
);

-- ============================================
-- FAVORITES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, product_id)
);

-- ============================================
-- FOLLOWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (follower_id, seller_id),
    CHECK (follower_id <> seller_id)
);

-- ============================================
-- SUBSCRIPTION PLANS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    duration_months INTEGER NOT NULL,
    benefits JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- SELLER SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS seller_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    start_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TRIGGERS & FUNCTIONS
-- ============================================

-- Function: Update timestamp on record update
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update users timestamp
DROP TRIGGER IF EXISTS trg_users_updated ON users;
CREATE TRIGGER trg_users_updated
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Trigger: Update products timestamp
DROP TRIGGER IF EXISTS trg_products_updated ON products;
CREATE TRIGGER trg_products_updated
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Trigger: Update orders timestamp
DROP TRIGGER IF EXISTS trg_orders_updated ON orders;
CREATE TRIGGER trg_orders_updated
BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Function: Update stock after order
CREATE OR REPLACE FUNCTION update_stock_after_order()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET stock = stock - NEW.quantity,
      sold = sold + NEW.quantity
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update stock after order
DROP TRIGGER IF EXISTS trg_stock_after_order ON order_items;
CREATE TRIGGER trg_stock_after_order
AFTER INSERT ON order_items
FOR EACH ROW EXECUTE FUNCTION update_stock_after_order();

-- Function: Notify new product (for admin notification)
CREATE OR REPLACE FUNCTION notify_new_product()
RETURNS TRIGGER AS $$
BEGIN
    -- يمكن إضافة كود لإرسال إشعار للإدمن
    -- مثال: NOTIFY new_product_pending, 'Product ID: ' || NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Notify on new product
DROP TRIGGER IF EXISTS trg_new_product_notification ON products;
CREATE TRIGGER trg_new_product_notification
AFTER INSERT ON products
FOR EACH ROW EXECUTE FUNCTION notify_new_product();

-- ============================================
-- DEFAULT DATA
-- ============================================

-- Insert default categories
INSERT INTO categories (name, description, img) VALUES
    ('الفخار والسيراميك', 'منتجات فخارية وسيراميك يدوية تقليدية', '/images/categories/pottery.jpg'),
    ('المنسوجات', 'أقمشة ومنسوجات تقليدية مصنوعة يدوياً', '/images/categories/textiles.jpg'),
    ('المجوهرات والإكسسوارات', 'حلي وإكسسوارات حرفية فريدة', '/images/categories/jewelry.jpg'),
    ('الديكور المنزلي', 'قطع ديكور منزلية يدوية', '/images/categories/home-decor.jpg'),
    ('الفنون واللوحات', 'لوحات فنية ورسومات أصلية', '/images/categories/art.jpg'),
    ('المنتجات الجلدية', 'منتجات جلدية مصنوعة يدوياً', '/images/categories/leather.jpg'),
    ('الأعمال الخشبية', 'منتجات خشبية منحوتة وأثاث', '/images/categories/wood.jpg'),
    ('الأعمال المعدنية', 'فنون معدنية وديكورات', '/images/categories/metal.jpg')
ON CONFLICT (name) DO NOTHING;

-- Insert default subscription plans
INSERT INTO subscription_plans (name, price, duration_months, benefits, is_active) VALUES
    ('المجانية', 0, 1, '{"featured_listings": 0, "analytics": false, "priority_support": false, "description": "خطة مجانية للبدء"}', true),
    ('المميزة الشهرية', 2999.00, 1, '{"featured_listings": 5, "analytics": true, "priority_support": true, "description": "خطة شهرية مميزة"}', true),
    ('المميزة السنوية', 29990.00, 12, '{"featured_listings": 10, "analytics": true, "priority_support": true, "discount": "20%", "description": "خطة سنوية مع خصم 20%"}', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- INDEXES (للأداء الأفضل)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_seller ON follows(seller_id);

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '✅ Database schema created successfully!';
    RAISE NOTICE '📊 Tables created: users, categories, products, orders, order_items, reviews, favorites, follows, subscription_plans, seller_subscriptions';
    RAISE NOTICE '🔧 Triggers configured for: timestamps, stock updates, notifications';
    RAISE NOTICE '📝 Default data inserted: 8 categories, 3 subscription plans';
    RAISE NOTICE '🚀 Database is ready to use!';
END $$;
