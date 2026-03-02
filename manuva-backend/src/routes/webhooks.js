const express = require('express');
const { Webhook } = require('svix');
const db = require('../config/database');
const router = express.Router();

router.post('/clerk', express.raw({ type: 'application/json' }), async (req, res) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('No CLERK_WEBHOOK_SECRET in environment');
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  const headers = req.headers;
  const payload = req.body; 
  const svix_id = headers['svix-id'];
  const svix_timestamp = headers['svix-timestamp'];
  const svix_signature = headers['svix-signature'];

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({
      success: false,
      message: 'Error occured -- no svix headers',
    });
  }

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt;

  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err.message);
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { email_addresses, first_name, last_name, image_url } = evt.data;
    const email = email_addresses && email_addresses.length > 0 ? email_addresses[0].email_address : '';
    const name = `${first_name || ''} ${last_name || ''}`.trim() || 'User';

    try {
      if (eventType === 'user.created') {
        await db.query(`
          INSERT INTO users (clerk_id, email, name, role, profile_img, password)
          VALUES ($1, $2, $3, 'customer', $4, 'clerk_managed')
          ON CONFLICT (email) DO UPDATE 
          SET clerk_id = $1, name = $3, profile_img = $4
        `, [id, email, name, image_url]);
      } else {
        await db.query(`
          UPDATE users
          SET name = $2, profile_img = $3, email = $4
          WHERE clerk_id = $1
        `, [id, name, image_url, email]);
      }
    } catch (dbError) {
      console.error('Database error in webhook:', dbError);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
  }

  if (eventType === 'user.deleted') {
    try {
      await db.query(`DELETE FROM users WHERE clerk_id = $1`, [id]);
    } catch (dbError) {
      console.error('Database error in webhook delete:', dbError);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
  }

  return res.status(200).json({
    success: true,
    message: 'Webhook received',
  });
});

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
