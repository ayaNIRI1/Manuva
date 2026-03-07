const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

/**
 * CART LOGIC (status = '1')
 */

// Add product to cart (or create new cart)
router.post('/cart', auth,
  [
    body('product_id').notEmpty().withMessage('Product ID is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
  ],
  async (req, res) => {
    const client = await db.pool.connect();
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { product_id, quantity } = req.body;
      const buyer_id = req.user.id;

      await client.query('BEGIN');

      const productResult = await client.query(
        'SELECT price, stock FROM products WHERE id = $1 AND status = $2',
        [product_id, 'approved']
      );

      if (productResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Product not found or not approved' });
      }

      const product = productResult.rows[0];

      let orderResult = await client.query(
        "SELECT id FROM orders WHERE buyer_id = $1 AND status = '1' LIMIT 1",
        [buyer_id]
      );

      let orderId;
      if (orderResult.rows.length > 0) {
        orderId = orderResult.rows[0].id;
      } else {
        const newOrderResult = await client.query(
          `INSERT INTO orders (buyer_id, total, status, shipping_address)
           VALUES ($1, $2, $3, $4) RETURNING id`,
          [buyer_id, 0, '1', JSON.stringify({})]
        );
        orderId = newOrderResult.rows[0].id;
      }

      const existingItem = await client.query(
        "SELECT id, quantity FROM order_items WHERE order_id = $1 AND product_id = $2",
        [orderId, product_id]
      );

      if (existingItem.rows.length > 0) {
        const newQuantity = existingItem.rows[0].quantity + quantity;
        if (newQuantity <= 0) {
          await client.query("DELETE FROM order_items WHERE id = $1", [existingItem.rows[0].id]);
        } else {
          await client.query(
            "UPDATE order_items SET quantity = $1 WHERE id = $2",
            [newQuantity, existingItem.rows[0].id]
          );
        }
      } else if (quantity > 0) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
           VALUES ($1, $2, $3, $4)`,
          [orderId, product_id, quantity, product.price]
        );
      }

      await client.query(
        `UPDATE orders SET total = (SELECT COALESCE(SUM(subtotal), 0) FROM order_items WHERE order_id = $1)
         WHERE id = $1`,
        [orderId]
      );

      // Check if cart is now empty
      const checkItems = await client.query("SELECT COUNT(*) FROM order_items WHERE order_id = $1", [orderId]);
      if (parseInt(checkItems.rows[0].count) === 0) {
        await client.query("DELETE FROM orders WHERE id = $1", [orderId]);
        await client.query('COMMIT');
        return res.status(200).json({ message: 'Cart emptied and removed', cart: { id: null, items: [] } });
      }

      await client.query('COMMIT');

      const updatedOrder = await db.query(
        `SELECT o.*, json_agg(json_build_object(
          'id', oi.id, 'product_id', oi.product_id, 'product_name', p.name,
          'product_image', p.image_url, 'quantity', oi.quantity,
          'price_at_purchase', oi.price_at_purchase, 'subtotal', oi.subtotal
        )) as items
        FROM orders o 
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE o.id = $1 GROUP BY o.id`,
        [orderId]
      );

      res.status(200).json({ message: 'Product added to cart', cart: updatedOrder.rows[0] });
    } catch (error) {
      if (client) await client.query('ROLLBACK');
      console.error('Add/Update cart error:', error);
      res.status(500).json({ 
        error: 'Failed to update cart', 
        details: error.message,
        code: error.code
      });
    } finally {
      if (client) client.release();
    }
  }
);

// Get current cart
router.get('/cart', auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT o.*, 
              json_agg(json_build_object(
                'id', oi.id, 'product_id', oi.product_id, 'product_name', p.name,
                'product_image', p.image_url, 'quantity', oi.quantity,
                'price_at_purchase', oi.price_at_purchase, 'subtotal', oi.subtotal
              )) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE o.buyer_id = $1 AND o.status = '1'
       GROUP BY o.id`,
      [req.user.id]
    );

    if (result.rows.length > 0) {
      const cart = result.rows[0];
      // Filter out null items from LEFT JOIN
      const cleanItems = (cart.items || []).filter(item => item && item.id);
      
      if (cleanItems.length === 0) {
        // Self-heal: If an active cart order exists but bears no items, remove it
        await db.query("DELETE FROM orders WHERE id = $1", [cart.id]);
        return res.json({ id: null, items: [] });
      }
      
      return res.json({ ...cart, items: cleanItems });
    }

    res.json({ id: null, items: [] });
  } catch (error) {
    console.error('Fetch cart error:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Remove from cart
router.delete('/cart/:productId', auth, async (req, res) => {
  const { productId } = req.params;
  
  // Basic UUID validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(productId)) {
    return res.status(400).json({ error: 'Invalid product ID format' });
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const buyerId = req.user.id;
    console.log(`DELETE /cart/${productId} called by buyer ${buyerId}`);

    const orderResult = await client.query("SELECT id FROM orders WHERE buyer_id = $1 AND status = '1' LIMIT 1", [buyerId]);
    
    if (orderResult.rows.length === 0) {
      console.log('No active cart found for user');
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Cart not found' });
    }
    
    const orderId = orderResult.rows[0].id;
    console.log(`Found active cart ${orderId}, attempting to delete item ${productId}`);

    const delRes = await client.query("DELETE FROM order_items WHERE order_id = $1 AND product_id = $2", [orderId, productId]);
    console.log(`Delete operation result: ${delRes.rowCount} row(s) deleted`);

    await client.query("UPDATE orders SET total = (SELECT COALESCE(SUM(subtotal), 0) FROM order_items WHERE order_id = $1) WHERE id = $1", [orderId]);
    
    // Check if cart is now empty
    const checkItems = await client.query("SELECT COUNT(*) FROM order_items WHERE order_id = $1", [orderId]);
    if (parseInt(checkItems.rows[0].count) === 0) {
      await client.query("DELETE FROM orders WHERE id = $1", [orderId]);
      await client.query('COMMIT');
      return res.json({ message: 'Item removed and cart cleared', cart: { id: null, items: [] } });
    }

    await client.query('COMMIT');

    const updatedOrder = await db.query(
      `SELECT o.*, json_agg(json_build_object(
        'id', oi.id, 'product_id', oi.product_id, 'product_name', p.name,
        'product_image', p.image_url, 'quantity', oi.quantity,
        'price_at_purchase', oi.price_at_purchase, 'subtotal', oi.subtotal
      )) as items
      FROM orders o 
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.id = $1 GROUP BY o.id`,
      [orderId]
    );

    res.json({ message: 'Item removed', cart: updatedOrder.rows[0] });
  } catch (error) {
    if (client) await client.query('ROLLBACK');
    console.error('Remove from cart error:', error);
    res.status(500).json({ 
      error: 'Failed to remove item', 
      details: error.message,
      code: error.code
    });
  } finally {
    if (client) client.release();
  }
});

/**
 * CHECKOUT & ORDER LOGIC
 */

// Checkout an existing cart
router.post('/checkout/:orderId', auth,
  [
    body('shipping_address').isObject(),
    body('payment_method').notEmpty()
  ],
  async (req, res) => {
    const client = await db.pool.connect();
    try {
      const { orderId } = req.params;
      const { shipping_address, payment_method } = req.body;
      await client.query('BEGIN');

      const orderCheck = await client.query(
        "SELECT id, total FROM orders WHERE id = $1 AND buyer_id = $2 AND status = '1'",
        [orderId, req.user.id]
      );
      if (orderCheck.rows.length === 0) throw new Error('Active cart not found');

      const total = parseFloat(orderCheck.rows[0].total);
      const platform_fee = (total * 0.05).toFixed(2);
      const seller_payout = (total - platform_fee).toFixed(2);

      const result = await client.query(
        `UPDATE orders SET status = 'pending', shipping_address = $1, payment_method = $2,
         platform_fee = $3, seller_payout = $4, updated_at = CURRENT_TIMESTAMP
         WHERE id = $5 RETURNING *`,
        [JSON.stringify(shipping_address), payment_method, platform_fee, seller_payout, orderId]
      );
      await client.query('COMMIT');
      res.json(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      res.status(500).json({ error: error.message });
    } finally {
      client.release();
    }
  }
);

// Standard Order (Direct)
router.post('/', auth,
  [
    body('items').isArray({ min: 1 }),
    body('shipping_address').isObject(),
    body('payment_method').notEmpty()
  ],
  async (req, res) => {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      const { items, shipping_address, payment_method } = req.body;
      let total = 0;
      const orderItems = [];

      for (const item of items) {
        const p = await client.query('SELECT price FROM products WHERE id = $1 AND status = $2', [item.product_id, 'approved']);
        if (p.rows.length === 0) throw new Error(`Product ${item.product_id} not available`);
        total += p.rows[0].price * item.quantity;
        orderItems.push({ ...item, price: p.rows[0].price });
      }

      const platform_fee = (total * 0.05).toFixed(2);
      const seller_payout = (total - platform_fee).toFixed(2);

      const orderRes = await client.query(
        `INSERT INTO orders (buyer_id, total, shipping_address, payment_method, platform_fee, seller_payout, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'pending') RETURNING id`,
        [req.user.id, total, JSON.stringify(shipping_address), payment_method, platform_fee, seller_payout]
      );
      const orderId = orderRes.rows[0].id;

      for (const item of orderItems) {
        await client.query(`INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES ($1, $2, $3, $4)`,
          [orderId, item.product_id, item.quantity, item.price]);
      }
      await client.query('COMMIT');
      res.status(201).json({ id: orderId });
    } catch (error) {
      await client.query('ROLLBACK');
      res.status(500).json({ error: error.message });
    } finally { client.release(); }
  }
);

/**
 * FETCHING ORDERS
 */

// Get user orders (excluding carts)
router.get('/', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let query = `
      SELECT o.*, json_agg(json_build_object(
        'id', oi.id, 'product_id', oi.product_id, 'product_name', p.name,
        'product_image', p.image_url, 'quantity', oi.quantity,
        'price_at_purchase', oi.price_at_purchase, 'subtotal', oi.subtotal, 'seller_name', u.name
      )) as items
      FROM orders o JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      JOIN users u ON p.seller_id = u.id
      WHERE o.buyer_id = $1 AND o.status != '1'
    `;
    const values = [req.user.id];
    if (status) { query += ` AND o.status = $2`; values.push(status); }
    query += ` GROUP BY o.id ORDER BY o.created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);

    const result = await db.query(query, values);
    res.json(result.rows);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch orders' }); }
});

// Get single order
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT o.*, json_agg(json_build_object(
        'id', oi.id, 'product_id', oi.product_id, 'product_name', p.name,
        'product_image', p.image_url, 'quantity', oi.quantity,
        'price_at_purchase', oi.price_at_purchase, 'subtotal', oi.subtotal, 'seller_id', p.seller_id, 'seller_name', u.name
      )) as items
      FROM orders o JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      JOIN users u ON p.seller_id = u.id
      WHERE o.id = $1 AND o.buyer_id = $2 GROUP BY o.id`,
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    res.json(result.rows[0]);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch order' }); }
});

// Update order status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const result = await db.query(
      `UPDATE orders SET status = $1 WHERE id = $2 AND (buyer_id = $3 OR EXISTS (
        SELECT 1 FROM order_items oi JOIN products p ON oi.product_id = p.id 
        WHERE oi.order_id = orders.id AND p.seller_id = $3
      )) RETURNING *`,
      [status, id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    res.json(result.rows[0]);
  } catch (error) { res.status(500).json({ error: 'Failed to update status' }); }
});

// Update payment status
router.patch('/:id/payment', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status } = req.body;
    const validStatuses = ['pending', 'paid', 'failed'];
    if (!validStatuses.includes(payment_status)) return res.status(400).json({ error: 'Invalid payment status' });

    const result = await db.query(
      `UPDATE orders SET payment_status = $1 WHERE id = $2 AND buyer_id = $3 RETURNING *`,
      [payment_status, id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    res.json(result.rows[0]);
  } catch (error) { res.status(500).json({ error: 'Failed to update payment' }); }
});

// Get seller orders
router.get('/seller/orders', auth, async (req, res) => {
  try {
    if (req.user.role !== 'artisan' && req.user.role !== 'admin') return res.status(403).json({ error: 'Artisan access required' });
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let query = `
      SELECT o.*, u.name as buyer_name, u.email as buyer_email,
             json_agg(json_build_object(
               'id', oi.id, 'product_id', oi.product_id, 'product_name', p.name,
               'product_image', p.image_url, 'quantity', oi.quantity,
               'price_at_purchase', oi.price_at_purchase, 'subtotal', oi.subtotal
             )) as items
      FROM orders o JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id JOIN users u ON o.buyer_id = u.id
      WHERE p.seller_id = $1 AND o.status != '1'
    `;
    const values = [req.user.id];
    if (status) { query += ` AND o.status = $2`; values.push(status); }
    query += ` GROUP BY o.id, u.name, u.email ORDER BY o.created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);
    const result = await db.query(query, values);
    res.json(result.rows);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch seller orders' }); }
});

module.exports = router;
