const express = require('express');
const { ChargilyClient } = require('@chargily/chargily-pay');
const db = require('../config/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

const client = new ChargilyClient({
  api_key: process.env.CHARGILY_APP_SECRET,
  mode: 'test', // or 'live'
});

// Create payment session
router.post('/checkout', auth, async (req, res) => {
  try {
    const { order_id, amount, success_url, failure_url } = req.body;

    // Validate if order exists and belongs to the user
    const orderResult = await db.query(
      'SELECT * FROM orders WHERE id = $1 AND buyer_id = $2',
      [order_id, req.user.id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    console.log('Creating checkout for order:', order_id, 'Amount:', amount);

    const checkout = await client.createCheckout({
      amount: parseFloat(amount),
      currency: 'dzd',
      success_url: success_url || `${process.env.FRONTEND_URL}/store/orders?success=true`,
      failure_url: failure_url || `${process.env.FRONTEND_URL}/store/orders?canceled=true`,
      metadata: {
        order_id: order_id.toString()
      },
    });

    console.log('Checkout created successfully:', checkout.checkout_url);
    res.json({ checkout_url: checkout.checkout_url });
  } catch (error) {
    console.error('Chargily checkout error:', error);
    try {
      require('fs').appendFileSync('error.log', `[${new Date().toISOString()}] Chargily checkout error: ${error.message}\n${error.stack}\n\n`);
    } catch (logError) {
      console.error('Failed to log to file:', logError);
    }
    res.status(500).json({ error: 'Failed to create payment session', details: error.message });
  }
});

module.exports = router;
