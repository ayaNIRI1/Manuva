const express = require('express');
const db = require('../config/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get user favorites
router.get('/favorites', auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.*, f.created_at as favorited_at,
              c.name as category_name,
              u.name as seller_name, u.profile_img as seller_img,
              COALESCE(AVG(r.rating), 0) as avg_rating,
              COUNT(DISTINCT r.id) as review_count
       FROM favorites f
       JOIN products p ON f.product_id = p.id
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN users u ON p.seller_id = u.id
       LEFT JOIN reviews r ON p.id = r.product_id
       WHERE f.user_id = $1 AND p.status = 'approved'
       GROUP BY p.id, f.created_at, c.name, u.name, u.profile_img
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// Add to favorites
router.post('/favorites/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;

    // Check if product exists
    const productCheck = await db.query('SELECT id FROM products WHERE id = $1', [productId]);
    if (productCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Add to favorites (ignore if already exists)
    await db.query(
      `INSERT INTO favorites (user_id, product_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, product_id) DO NOTHING`,
      [req.user.id, productId]
    );

    res.json({ message: 'Added to favorites' });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

// Remove from favorites
router.delete('/favorites/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;

    await db.query(
      'DELETE FROM favorites WHERE user_id = $1 AND product_id = $2',
      [req.user.id, productId]
    );

    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

// Check if product is favorited
router.get('/favorites/:productId/check', auth, async (req, res) => {
  try {
    const { productId } = req.params;

    const result = await db.query(
      'SELECT id FROM favorites WHERE user_id = $1 AND product_id = $2',
      [req.user.id, productId]
    );

    res.json({ is_favorited: result.rows.length > 0 });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({ error: 'Failed to check favorite status' });
  }
});

// Get followed sellers
router.get('/following', auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT u.id, u.name, u.bio, u.profile_img, u.location,
              f.created_at as followed_at,
              (SELECT COUNT(*) FROM products WHERE seller_id = u.id AND status = 'approved') as product_count,
              (SELECT COUNT(*) FROM follows WHERE seller_id = u.id) as follower_count
       FROM follows f
       JOIN users u ON f.seller_id = u.id
       WHERE f.follower_id = $1 AND u.role = 'artisan'
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ error: 'Failed to fetch following list' });
  }
});

// Follow seller
router.post('/following/:sellerId', auth, async (req, res) => {
  try {
    const { sellerId } = req.params;

    // Check if seller exists and is an artisan
    const sellerCheck = await db.query('SELECT id, role FROM users WHERE id = $1', [sellerId]);
    if (sellerCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Seller not found' });
    }
    if (sellerCheck.rows[0].role !== 'artisan') {
      return res.status(400).json({ error: 'User is not an artisan' });
    }

    // Cannot follow yourself
    if (sellerId === req.user.id) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    // Follow seller (ignore if already following)
    await db.query(
      `INSERT INTO follows (follower_id, seller_id)
       VALUES ($1, $2)
       ON CONFLICT (follower_id, seller_id) DO NOTHING`,
      [req.user.id, sellerId]
    );

    res.json({ message: 'Following seller' });
  } catch (error) {
    console.error('Follow seller error:', error);
    res.status(500).json({ error: 'Failed to follow seller' });
  }
});

// Unfollow seller
router.delete('/following/:sellerId', auth, async (req, res) => {
  try {
    const { sellerId } = req.params;

    await db.query(
      'DELETE FROM follows WHERE follower_id = $1 AND seller_id = $2',
      [req.user.id, sellerId]
    );

    res.json({ message: 'Unfollowed seller' });
  } catch (error) {
    console.error('Unfollow seller error:', error);
    res.status(500).json({ error: 'Failed to unfollow seller' });
  }
});

// Check if following seller
router.get('/following/:sellerId/check', auth, async (req, res) => {
  try {
    const { sellerId } = req.params;

    const result = await db.query(
      'SELECT id FROM follows WHERE follower_id = $1 AND seller_id = $2',
      [req.user.id, sellerId]
    );

    res.json({ is_following: result.rows.length > 0 });
  } catch (error) {
    console.error('Check following error:', error);
    res.status(500).json({ error: 'Failed to check following status' });
  }
});

module.exports = router;
