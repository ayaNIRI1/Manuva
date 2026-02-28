const express = require('express');
const db = require('../config/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

// GET /api/chat/conversations — list all conversations for logged-in user
router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `SELECT
         c.id,
         c.buyer_id,
         c.seller_id,
         c.created_at,
         c.updated_at,
         buyer.name    AS buyer_name,
         buyer.profile_img AS buyer_avatar,
         seller.name   AS seller_name,
         seller.profile_img AS seller_avatar,
         (
           SELECT m.content
           FROM   messages m
           WHERE  m.conversation_id = c.id
           ORDER  BY m.created_at DESC
           LIMIT  1
         ) AS last_message,
         (
           SELECT m.created_at
           FROM   messages m
           WHERE  m.conversation_id = c.id
           ORDER  BY m.created_at DESC
           LIMIT  1
         ) AS last_message_at,
         (
           SELECT COUNT(*)::int
           FROM   messages m
           WHERE  m.conversation_id = c.id
             AND  m.is_read = FALSE
             AND  m.sender_id != $1
         ) AS unread_count
       FROM conversations c
       JOIN users buyer  ON c.buyer_id  = buyer.id
       JOIN users seller ON c.seller_id = seller.id
       WHERE c.buyer_id = $1 OR c.seller_id = $1
       ORDER BY last_message_at DESC NULLS LAST`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// POST /api/chat/conversations — start or fetch existing conversation
router.post('/conversations', auth, async (req, res) => {
  try {
    const buyerId  = req.user.id;
    const { seller_id } = req.body;

    if (!seller_id) {
      return res.status(400).json({ error: 'seller_id is required' });
    }

    if (buyerId === seller_id) {
      return res.status(400).json({ error: 'Cannot chat with yourself' });
    }

    // Upsert: get existing or create new conversation
    const result = await db.query(
      `INSERT INTO conversations (buyer_id, seller_id)
       VALUES ($1, $2)
       ON CONFLICT (buyer_id, seller_id) DO UPDATE SET updated_at = NOW()
       RETURNING *`,
      [buyerId, seller_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// GET /api/chat/conversations/:id/messages — fetch message history
router.get('/conversations/:id/messages', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id }  = req.params;
    const { limit = 50, before } = req.query;

    // Verify this user is part of the conversation
    const conv = await db.query(
      'SELECT * FROM conversations WHERE id = $1 AND (buyer_id = $2 OR seller_id = $2)',
      [id, userId]
    );
    if (conv.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    let query = `
      SELECT m.*, u.name AS sender_name, u.profile_img AS sender_avatar
      FROM   messages m
      JOIN   users u ON m.sender_id = u.id
      WHERE  m.conversation_id = $1
    `;
    const values = [id];

    if (before) {
      query += ` AND m.created_at < $${values.length + 1}`;
      values.push(before);
    }

    query += ` ORDER BY m.created_at ASC LIMIT $${values.length + 1}`;
    values.push(parseInt(limit));

    const result = await db.query(query, values);

    // Mark messages as read
    await db.query(
      `UPDATE messages
       SET is_read = TRUE
       WHERE conversation_id = $1 AND sender_id != $2 AND is_read = FALSE`,
      [id, userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// GET /api/chat/unread-count
router.get('/unread-count', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `SELECT COUNT(*)::int AS count
       FROM messages m
       JOIN conversations c ON m.conversation_id = c.id
       WHERE (c.buyer_id = $1 OR c.seller_id = $1)
         AND m.sender_id != $1
         AND m.is_read = FALSE`,
      [userId]
    );

    res.json({ count: result.rows[0].count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

module.exports = router;
