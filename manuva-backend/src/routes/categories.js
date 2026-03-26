const express = require('express');
const db = require('../config/database');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT c.*, 
              (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.status = 'approved') as product_count
       FROM categories c
       WHERE c.is_approved = true
       ORDER BY c.name ASC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get single category
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT c.*, 
              (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.status = 'approved') as product_count
       FROM categories c
       WHERE c.id = $1 AND c.is_approved = true`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// Propose a new category
router.post('/', auth, upload.single('img'), async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required' });

    const img_url = req.file ? `/uploads/${req.file.filename}` : (req.body.img || null);

    const result = await db.query(
      'INSERT INTO categories (name, description, img, is_approved) VALUES ($1, $2, $3, false) RETURNING *',
      [name, description || '', img_url]
    );
    res.status(201).json({ message: 'Category requested successfully', category: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      return res.status(409).json({ error: 'A category with this name already exists or is pending approval.' });
    }
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Failed to request category' });
  }
});

module.exports = router;
