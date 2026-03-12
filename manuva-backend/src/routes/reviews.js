const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get product reviews
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const result = await db.query(
      `SELECT r.id, r.rating, r.comment, r.created_at, r.is_approved,
              u.name, u.profile_img
       FROM reviews r
       JOIN users u ON r.buyer_id = u.id
       WHERE r.product_id = $1 AND r.is_approved = true
       ORDER BY r.created_at DESC
       LIMIT $2 OFFSET $3`,
      [productId, limit, offset]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Create review
router.post('/', auth,
  [
    body('product_id').notEmpty(),
    body('rating').isInt({ min: 1, max: 5 }),
    body('comment').optional().trim()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { product_id, rating, comment } = req.body;

      // Check if user has purchased this product
      const purchaseCheck = await db.query(
        `SELECT o.id FROM orders o
         JOIN order_items oi ON o.id = oi.order_id
         WHERE o.buyer_id = $1 AND oi.product_id = $2 AND (o.payment_status = 'paid' OR o.status = 'delivered')
         LIMIT 1`,
        [req.user.id, product_id]
      );

      if (purchaseCheck.rows.length === 0) {
        return res.status(400).json({ error: 'You can only review products from completed or delivered orders' });
      }

      // Check if review already exists
      const existingReview = await db.query(
        'SELECT id FROM reviews WHERE product_id = $1 AND buyer_id = $2',
        [product_id, req.user.id]
      );

      if (existingReview.rows.length > 0) {
        return res.status(400).json({ error: 'You have already reviewed this product' });
      }

      // Create review
      const result = await db.query(
        `INSERT INTO reviews (product_id, buyer_id, rating, comment, is_approved)
         VALUES ($1, $2, $3, $4, false)
         RETURNING *`,
        [product_id, req.user.id, rating, comment]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Create review error:', error);
      res.status(500).json({ error: 'Failed to create review' });
    }
  }
);

// Update review
router.patch('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    // Verify ownership
    const reviewCheck = await db.query(
      'SELECT buyer_id FROM reviews WHERE id = $1',
      [id]
    );

    if (reviewCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (reviewCheck.rows[0].buyer_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this review' });
    }

    // Update review
    const result = await db.query(
      `UPDATE reviews 
       SET rating = COALESCE($1, rating), 
           comment = COALESCE($2, comment)
       WHERE id = $3
       RETURNING *`,
      [rating, comment, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// Delete review
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const reviewCheck = await db.query(
      'SELECT buyer_id FROM reviews WHERE id = $1',
      [id]
    );

    if (reviewCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (reviewCheck.rows[0].buyer_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this review' });
    }

    await db.query('DELETE FROM reviews WHERE id = $1', [id]);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

// Get all reviews for the authenticated user
router.get('/user', auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT r.*, 
              p.name as product_name, p.image_url as product_image
       FROM reviews r
       JOIN products p ON r.product_id = p.id
       WHERE r.buyer_id = $1
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch your reviews' });
  }
});


// Admin: Get all reviews
router.get('/admin/all', require('../middleware/auth').auth, require('../middleware/auth').isAdmin, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT r.id, r.rating, r.comment, r.created_at,
              u.name as buyer_name, u.profile_img as buyer_image,
              p.name as product_name, p.image_url as product_image, p.id as product_id
       FROM reviews r
       JOIN users u ON r.buyer_id = u.id
       JOIN products p ON r.product_id = p.id
       ORDER BY r.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Admin get reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Admin: Delete a review
router.delete('/admin/:id', require('../middleware/auth').auth, require('../middleware/auth').isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM reviews WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Review not found' });
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Admin delete review error:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

module.exports = router;
