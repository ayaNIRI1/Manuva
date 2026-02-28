const { createClerkClient } = require('@clerk/clerk-sdk-node');
const db = require('../config/database');

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = await clerkClient.verifyToken(token);
    const clerkId = decoded.sub;
    
    const result = await db.query(
      'SELECT id, email, name, role, is_active FROM users WHERE clerk_id = $1',
      [clerkId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid authentication token' });
  }
};

const isArtisan = async (req, res, next) => {
  if (req.user.role !== 'artisan' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Artisan access required' });
  }
  next();
};

const isAdmin = async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = { auth, isArtisan, isAdmin };
