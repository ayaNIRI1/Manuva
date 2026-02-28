const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Create order
router.post('/', auth,
  [
    body('items').isArray({ min: 1 }),
    body('items.*.product_id').notEmpty(),
    body('items.*.quantity').isInt({ min: 1 }),
    body('shipping_address').isObject(),
    body('shipping_address.address').notEmpty(),
    body('shipping_address.city').notEmpty(),
    body('payment_method').notEmpty()
  ],
  async (req, res) => {
    const client = await db.pool.connect();
    
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      await client.query('BEGIN');

      const {
        items,
        shipping_address,
        payment_method
      } = req.body;

      // Validate products and calculate total
      let total = 0;
      const orderItems = [];

      for (const item of items) {
        const productResult = await client.query(
          'SELECT id, price, stock, seller_id FROM products WHERE id = $1 AND status = $2',
          [item.product_id, 'approved']
        );

        if (productResult.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: `Product ${item.product_id} not found or not approved` });
        }

        const product = productResult.rows[0];

        if (product.stock < item.quantity) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: `Insufficient stock for product ${item.product_id}` });
        }

        const subtotal = product.price * item.quantity;
        total += parseFloat(subtotal);

        orderItems.push({
          product_id: product.id,
          quantity: item.quantity,
          price_at_purchase: product.price
        });
      }

      // Calculate platform fee (5% commission)
      const platform_fee = (total * 0.05).toFixed(2);
      const seller_payout = (total - platform_fee).toFixed(2);

      // Create order
      const orderResult = await client.query(
        `INSERT INTO orders 
         (buyer_id, total, shipping_address, payment_method, platform_fee, seller_payout)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [req.user.id, total, JSON.stringify(shipping_address), payment_method, platform_fee, seller_payout]
      );

      const order = orderResult.rows[0];

      // Create order items (this will trigger the stock update automatically)
      for (const item of orderItems) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
           VALUES ($1, $2, $3, $4)`,
          [order.id, item.product_id, item.quantity, item.price_at_purchase]
        );
      }

      await client.query('COMMIT');

      // Fetch complete order details
      const completeOrder = await db.query(
        `SELECT o.*, 
                json_agg(json_build_object(
                  'id', oi.id,
                  'product_id', oi.product_id,
                  'product_name', p.name,
                  'product_image', p.image_url,
                  'quantity', oi.quantity,
                  'price_at_purchase', oi.price_at_purchase,
                  'subtotal', oi.subtotal,
                  'seller_name', u.name
                )) as items
         FROM orders o
         JOIN order_items oi ON o.id = oi.order_id
         JOIN products p ON oi.product_id = p.id
         JOIN users u ON p.seller_id = u.id
         WHERE o.id = $1
         GROUP BY o.id`,
        [order.id]
      );

      res.status(201).json(completeOrder.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Create order error:', error);
      res.status(500).json({ error: 'Failed to create order' });
    } finally {
      client.release();
    }
  }
);

// Get user orders
router.get('/', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT o.*, 
             json_agg(json_build_object(
               'id', oi.id,
               'product_id', oi.product_id,
               'product_name', p.name,
               'product_image', p.image_url,
               'quantity', oi.quantity,
               'price_at_purchase', oi.price_at_purchase,
               'subtotal', oi.subtotal,
               'seller_name', u.name
             )) as items
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      JOIN users u ON p.seller_id = u.id
      WHERE o.buyer_id = $1
    `;

    const values = [req.user.id];
    let paramCount = 2;

    if (status) {
      query += ` AND o.status = $${paramCount++}`;
      values.push(status);
    }

    query += ` GROUP BY o.id ORDER BY o.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    const result = await db.query(query, values);

    res.json(result.rows);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get single order
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT o.*, 
              json_agg(json_build_object(
                'id', oi.id,
                'product_id', oi.product_id,
                'product_name', p.name,
                'product_image', p.image_url,
                'quantity', oi.quantity,
                'price_at_purchase', oi.price_at_purchase,
                'subtotal', oi.subtotal,
                'seller_id', p.seller_id,
                'seller_name', u.name
              )) as items
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       JOIN products p ON oi.product_id = p.id
       JOIN users u ON p.seller_id = u.id
       WHERE o.id = $1 AND o.buyer_id = $2
       GROUP BY o.id`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Update order status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await db.query(
      `UPDATE orders 
       SET status = $1
       WHERE id = $2 AND buyer_id = $3
       RETURNING *`,
      [status, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Update payment status
router.patch('/:id/payment', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status } = req.body;

    const validStatuses = ['pending', 'paid', 'failed'];
    if (!validStatuses.includes(payment_status)) {
      return res.status(400).json({ error: 'Invalid payment status' });
    }

    const result = await db.query(
      `UPDATE orders 
       SET payment_status = $1
       WHERE id = $2 AND buyer_id = $3
       RETURNING *`,
      [payment_status, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ error: 'Failed to update payment status' });
  }
});

// Get seller orders (artisan only)
router.get('/seller/orders', auth, async (req, res) => {
  try {
    if (req.user.role !== 'artisan' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Artisan access required' });
    }

    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT o.*, oi.*, p.name as product_name, p.image_url as product_image,
             u.name as buyer_name, u.email as buyer_email
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      JOIN users u ON o.buyer_id = u.id
      WHERE p.seller_id = $1
    `;

    const values = [req.user.id];
    let paramCount = 2;

    if (status) {
      query += ` AND o.status = $${paramCount++}`;
      values.push(status);
    }

    query += ` ORDER BY o.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    const result = await db.query(query, values);

    res.json(result.rows);
  } catch (error) {
    console.error('Get seller orders error:', error);
    res.status(500).json({ error: 'Failed to fetch seller orders' });
  }
});

module.exports = router;
