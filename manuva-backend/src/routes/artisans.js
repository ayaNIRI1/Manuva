const express = require('express');
const db = require('../config/database');
const { auth, isArtisan } = require('../middleware/auth');

const router = express.Router();

// Get all artisans
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT u.id, u.name, u.bio, u.profile_img, u.location,
             (SELECT COUNT(*) FROM products WHERE seller_id = u.id AND status = 'approved') as product_count,
             (SELECT COUNT(*) FROM follows WHERE seller_id = u.id) as follower_count,
             COALESCE(AVG(r.rating), 0) as avg_rating,
             COUNT(DISTINCT r.id) as review_count
      FROM users u
      LEFT JOIN products p ON u.id = p.seller_id
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE u.role = 'artisan' AND u.is_active = true
    `;

    const values = [];
    let paramCount = 1;

    if (search) {
      query += ` AND (u.name ILIKE $${paramCount} OR u.bio ILIKE $${paramCount})`;
      values.push(`%${search}%`);
      paramCount++;
    }

    query += ` GROUP BY u.id ORDER BY follower_count DESC, product_count DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    const result = await db.query(query, values);

    res.json(result.rows);
  } catch (error) {
    console.error('Get artisans error:', error);
    res.status(500).json({ error: 'Failed to fetch artisans' });
  }
});

// Get single artisan
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT u.id, u.name, u.bio, u.profile_img, u.location, u.created_at,
              (SELECT COUNT(*) FROM products WHERE seller_id = u.id AND status = 'approved') as product_count,
              (SELECT COUNT(*) FROM follows WHERE seller_id = u.id) as follower_count,
              (SELECT SUM(sold) FROM products WHERE seller_id = u.id) as total_sales,
              COALESCE(AVG(r.rating), 0) as avg_rating,
              COUNT(DISTINCT r.id) as review_count
       FROM users u
       LEFT JOIN products p ON u.id = p.seller_id
       LEFT JOIN reviews r ON p.id = r.product_id
       WHERE u.id = $1 AND u.role = 'artisan'
       GROUP BY u.id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Artisan not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get artisan error:', error);
    res.status(500).json({ error: 'Failed to fetch artisan' });
  }
});

// Get artisan's products
router.get('/:id/products', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const result = await db.query(
      `SELECT p.*, c.name as category_name,
              COALESCE(AVG(r.rating), 0) as avg_rating,
              COUNT(DISTINCT r.id) as review_count
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN reviews r ON p.id = r.product_id
       WHERE p.seller_id = $1 AND p.status = 'approved'
       GROUP BY p.id, c.name
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [id, limit, offset]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get artisan products error:', error);
    res.status(500).json({ error: 'Failed to fetch artisan products' });
  }
});

// Get artisan analytics (artisan only - own profile)
router.get('/dashboard/analytics', auth, isArtisan, async (req, res) => {
  try {
    // Get overall stats
    const stats = await db.query(
      `SELECT 
         (SELECT COUNT(*) FROM products WHERE seller_id = $1) as total_products,
         (SELECT COUNT(*) FROM products WHERE seller_id = $1 AND status = 'approved') as approved_products,
         (SELECT COUNT(*) FROM products WHERE seller_id = $1 AND status = 'pending') as pending_products,
         (SELECT SUM(sold) FROM products WHERE seller_id = $1) as total_items_sold,
         (SELECT COUNT(*) FROM follows WHERE seller_id = $1) as total_followers,
         (SELECT COALESCE(SUM(oi.subtotal), 0) FROM order_items oi 
          JOIN products p ON oi.product_id = p.id 
          WHERE p.seller_id = $1) as total_revenue,
         (SELECT COALESCE(AVG(r.rating), 0) FROM reviews r 
          JOIN products p ON r.product_id = p.id 
          WHERE p.seller_id = $1) as avg_rating`,
      [req.user.id]
    );

    // Get recent orders
    const recentOrders = await db.query(
      `SELECT o.id, o.order_date, o.status, o.total, oi.quantity, 
              p.name as product_name, p.image_url as product_image,
              u.name as buyer_name
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       JOIN products p ON oi.product_id = p.id
       JOIN users u ON o.buyer_id = u.id
       WHERE p.seller_id = $1
       ORDER BY o.order_date DESC
       LIMIT 10`,
      [req.user.id]
    );

    // Get top selling products
    const topProducts = await db.query(
      `SELECT p.id, p.name, p.image_url, p.price, p.sold, p.stock,
              COALESCE(AVG(r.rating), 0) as avg_rating
       FROM products p
       LEFT JOIN reviews r ON p.id = r.product_id
       WHERE p.seller_id = $1 AND p.status = 'approved'
       GROUP BY p.id
       ORDER BY p.sold DESC
       LIMIT 5`,
      [req.user.id]
    );

    // Get monthly revenue (last 6 months)
    const monthlyRevenue = await db.query(
      `SELECT 
         DATE_TRUNC('month', o.order_date) as month,
         COUNT(DISTINCT o.id) as order_count,
         COALESCE(SUM(oi.subtotal), 0) as revenue
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       JOIN products p ON oi.product_id = p.id
       WHERE p.seller_id = $1 
         AND o.payment_status = 'paid'
         AND o.order_date >= NOW() - INTERVAL '6 months'
       GROUP BY DATE_TRUNC('month', o.order_date)
       ORDER BY month DESC`,
      [req.user.id]
    );

    res.json({
      stats: stats.rows[0],
      recent_orders: recentOrders.rows,
      top_products: topProducts.rows,
      monthly_revenue: monthlyRevenue.rows
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get artisan's pending products
router.get('/dashboard/pending-products', auth, isArtisan, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.seller_id = $1 AND p.status = 'pending'
       ORDER BY p.created_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get pending products error:', error);
    res.status(500).json({ error: 'Failed to fetch pending products' });
  }
});

module.exports = router;
