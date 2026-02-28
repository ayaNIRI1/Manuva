const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { auth, isArtisan, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all products (with filters and search)
router.get('/', async (req, res) => {
  try {
    const {
      category_id,
      seller_id,
      search,
      material,
      theme,
      color,
      size,
      min_price,
      max_price,
      status = 'approved',
      is_featured,
      sort_by = 'created_at',
      order = 'DESC',
      page = 1,
      limit = 20
    } = req.query;

    const offset = (page - 1) * limit;
    const conditions = [];
    const values = [];
    let paramCount = 1;

    // Only show approved products by default (unless admin)
    if (status) {
      conditions.push(`p.status = $${paramCount++}`);
      values.push(status);
    }

    if (category_id) {
      conditions.push(`p.category_id = $${paramCount++}`);
      values.push(category_id);
    }

    if (seller_id) {
      conditions.push(`p.seller_id = $${paramCount++}`);
      values.push(seller_id);
    }

    if (search) {
      conditions.push(`(p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`);
      values.push(`%${search}%`);
      paramCount++;
    }

    if (material) {
      conditions.push(`p.material ILIKE $${paramCount++}`);
      values.push(`%${material}%`);
    }

    if (theme) {
      conditions.push(`p.theme ILIKE $${paramCount++}`);
      values.push(`%${theme}%`);
    }

    if (color) {
      conditions.push(`p.color ILIKE $${paramCount++}`);
      values.push(`%${color}%`);
    }

    if (size) {
      conditions.push(`p.size ILIKE $${paramCount++}`);
      values.push(`%${size}%`);
    }

    if (min_price) {
      conditions.push(`p.price >= $${paramCount++}`);
      values.push(min_price);
    }

    if (max_price) {
      conditions.push(`p.price <= $${paramCount++}`);
      values.push(max_price);
    }

    if (is_featured !== undefined) {
      conditions.push(`p.is_featured = $${paramCount++}`);
      values.push(is_featured === 'true');
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    const validSortColumns = ['created_at', 'price', 'sold', 'name'];
    const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Get total count
    const countResult = await db.query(
      `SELECT COUNT(*) FROM products p ${whereClause}`,
      values
    );
    const totalProducts = parseInt(countResult.rows[0].count);

    // Get products with seller info and average rating
    const result = await db.query(
      `SELECT p.*, 
              c.name as category_name,
              u.name as seller_name, u.profile_img as seller_img, u.location as seller_location,
              COALESCE(AVG(r.rating), 0) as avg_rating,
              COUNT(DISTINCT r.id) as review_count
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN users u ON p.seller_id = u.id
       LEFT JOIN reviews r ON p.id = r.product_id
       ${whereClause}
       GROUP BY p.id, c.name, u.name, u.profile_img, u.location
       ORDER BY p.${sortColumn} ${sortOrder}
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...values, limit, offset]
    );

    res.json({
      products: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalProducts,
        pages: Math.ceil(totalProducts / limit)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT p.*, 
              c.name as category_name,
              u.id as seller_id, u.name as seller_name, u.bio as seller_bio,
              u.profile_img as seller_img, u.location as seller_location,
              COALESCE(AVG(r.rating), 0) as avg_rating,
              COUNT(DISTINCT r.id) as review_count,
              (SELECT COUNT(*) FROM follows WHERE seller_id = u.id) as seller_followers
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN users u ON p.seller_id = u.id
       LEFT JOIN reviews r ON p.id = r.product_id
       WHERE p.id = $1
       GROUP BY p.id, c.name, u.id, u.name, u.bio, u.profile_img, u.location`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create product (artisan only)
router.post('/', auth, isArtisan,
  [
    body('name').trim().notEmpty(),
    body('description').trim().notEmpty(),
    body('price').isFloat({ min: 0 }),
    body('stock').isInt({ min: 0 }),
    body('category_id').notEmpty()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        name,
        description,
        price,
        stock,
        category_id,
        material,
        size,
        color,
        theme,
        image_url
      } = req.body;

      const result = await db.query(
        `INSERT INTO products 
         (seller_id, category_id, name, description, price, stock, material, size, color, theme, image_url, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending')
         RETURNING *`,
        [req.user.id, category_id, name, description, price, stock, material, size, color, theme, image_url]
      );

      const product = result.rows[0];

      res.status(201).json({ 
        product,
        message: 'Product created successfully and is pending approval'
      });
    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({ error: 'Failed to create product' });
    }
  }
);

// Update product (artisan only - own products)
router.patch('/:id', auth, isArtisan, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const productCheck = await db.query('SELECT seller_id FROM products WHERE id = $1', [id]);
    if (productCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    if (productCheck.rows[0].seller_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this product' });
    }

    const allowedFields = ['name', 'description', 'price', 'stock', 'category_id', 
                           'material', 'size', 'color', 'theme', 'image_url', 'is_featured'];
    const updates = [];
    const values = [];
    let paramCount = 1;

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = $${paramCount++}`);
        values.push(req.body[field]);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);

    const result = await db.query(
      `UPDATE products SET ${updates.join(', ')} 
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product (artisan only - own products)
router.delete('/:id', auth, isArtisan, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const productCheck = await db.query('SELECT seller_id FROM products WHERE id = $1', [id]);
    if (productCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    if (productCheck.rows[0].seller_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this product' });
    }

    await db.query('DELETE FROM products WHERE id = $1', [id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Get featured products
router.get('/featured/list', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.*, 
              c.name as category_name,
              u.name as seller_name, u.profile_img as seller_img,
              COALESCE(AVG(r.rating), 0) as avg_rating,
              COUNT(DISTINCT r.id) as review_count
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN users u ON p.seller_id = u.id
       LEFT JOIN reviews r ON p.id = r.product_id
       WHERE p.is_featured = true AND p.status = 'approved'
       GROUP BY p.id, c.name, u.name, u.profile_img
       ORDER BY p.created_at DESC
       LIMIT 20`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({ error: 'Failed to fetch featured products' });
  }
});

// Admin: Approve/Reject product
router.patch('/:id/approve', auth, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be approved or rejected' });
    }

    const result = await db.query(
      `UPDATE products 
       SET status = $1, approved_by = $2, approved_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [status, req.user.id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Approve product error:', error);
    res.status(500).json({ error: 'Failed to approve product' });
  }
});

module.exports = router;
