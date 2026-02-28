const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const errorHandler = require('./middleware/errorHandler');
const db = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const orderRoutes = require('./routes/orders');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/user');
const artisanRoutes = require('./routes/artisans');
const chatRoutes = require('./routes/chat');
const contactRoutes = require('./routes/contact');

const app = express();
const server = http.createServer(app);

// ─── Socket.io setup ───────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// JWT auth middleware for sockets
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await db.query(
      'SELECT id, name, role FROM users WHERE id = $1 AND is_active = TRUE',
      [decoded.userId]
    );
    if (result.rows.length === 0) return next(new Error('User not found'));

    socket.user = result.rows[0];
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.user.name} (${socket.user.id})`);

  // Join a conversation room
  socket.on('join_conversation', (conversationId) => {
    socket.join(`conv_${conversationId}`);
  });

  // Leave a conversation room
  socket.on('leave_conversation', (conversationId) => {
    socket.leave(`conv_${conversationId}`);
  });

  // Send a message
  socket.on('send_message', async ({ conversationId, content }, callback) => {
    try {
      if (!content || !content.trim()) return;

      // Verify user belongs to this conversation
      const conv = await db.query(
        'SELECT * FROM conversations WHERE id = $1 AND (buyer_id = $2 OR seller_id = $2)',
        [conversationId, socket.user.id]
      );
      if (conv.rows.length === 0) {
        if (callback) callback({ error: 'Access denied' });
        return;
      }

      // Persist message
      const result = await db.query(
        `INSERT INTO messages (conversation_id, sender_id, content)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [conversationId, socket.user.id, content.trim()]
      );

      const message = {
        ...result.rows[0],
        sender_name: socket.user.name,
      };

      // Update conversation updated_at
      await db.query(
        'UPDATE conversations SET updated_at = NOW() WHERE id = $1',
        [conversationId]
      );

      // Broadcast to room
      io.to(`conv_${conversationId}`).emit('new_message', message);

      if (callback) callback({ success: true, message });
    } catch (error) {
      console.error('Send message error:', error);
      if (callback) callback({ error: 'Failed to send message' });
    }
  });

  // Mark messages as read
  socket.on('mark_read', async ({ conversationId }) => {
    try {
      await db.query(
        `UPDATE messages SET is_read = TRUE
         WHERE conversation_id = $1 AND sender_id != $2 AND is_read = FALSE`,
        [conversationId, socket.user.id]
      );
      socket.to(`conv_${conversationId}`).emit('messages_read', {
        conversationId,
        readBy: socket.user.id,
      });
    } catch (error) {
      console.error('Mark read error:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`❌ Socket disconnected: ${socket.user.name}`);
  });
});
// ───────────────────────────────────────────────────────────────────────────

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Manuva API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/user', userRoutes);
app.use('/api/artisans', artisanRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/contact', contactRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log('=================================');
  console.log('🚀 Manuva Backend Server');
  console.log('=================================');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`💬 Socket.io: enabled`);
  console.log('=================================');
});

module.exports = app;
