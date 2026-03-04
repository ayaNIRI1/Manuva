const express = require('express');
const db = require('../config/database');
const router = express.Router();

// Chargily Webhook
router.post('/chargily', express.json(), async (req, res) => {
  const payload = req.body;
  const signature = req.headers['chargily-signature'];

  // Verification step (simplified for now, ideally use SDK)
  // if (!verifyChargilySignature(payload, signature)) { ... }

  try {
    const { type, data } = payload;

    if (type === 'checkout.paid') {
      const orderId = data.metadata.find(m => m.name === 'order_id')?.value;
      
      if (orderId) {
        await db.query(
          "UPDATE orders SET payment_status = 'paid', status = 'confirmed' WHERE id = $1",
          [orderId]
        );
        console.log(`✅ Order ${orderId} marked as paid via Chargily`);
      }
    } else if (type === 'checkout.failed') {
      const orderId = data.metadata.find(m => m.name === 'order_id')?.value;
      if (orderId) {
        await db.query(
          "UPDATE orders SET payment_status = 'failed' WHERE id = $1",
          [orderId]
        );
        console.log(`❌ Order ${orderId} payment failed via Chargily`);
      }
    }

    res.status(200).send('Webhook processed');
  } catch (error) {
    console.error('Chargily webhook error:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
