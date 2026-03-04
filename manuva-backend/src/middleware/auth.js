const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { verifyFirebaseToken } = require('../config/firebaseAdmin');

const getOrCreateFirebaseUser = async (decoded) => {
  const firebaseUid = decoded.uid;
  const email = decoded.email;

  if (!email) {
    throw new Error('Firebase token is missing email claim');
  }

  const existing = await db.query(
    `SELECT id, email, name, role, is_active, profile_img
     FROM users
     WHERE firebase_uid = $1 OR email = $2
     LIMIT 1`,
    [firebaseUid, email]
  );

  if (existing.rows.length > 0) {
    const user = existing.rows[0];

    if (!user.is_active) {
      throw new Error('Account is deactivated');
    }

    await db.query(
      `UPDATE users
       SET firebase_uid = COALESCE(firebase_uid, $1),
           name = COALESCE($2, name),
           profile_img = COALESCE($3, profile_img)
       WHERE id = $4`,
      [firebaseUid, decoded.name || null, decoded.picture || null, user.id]
    );

    return user;
  }

  const created = await db.query(
    `INSERT INTO users (firebase_uid, email, name, role, profile_img, password)
     VALUES ($1, $2, $3, 'customer', $4, 'firebase_managed')
     RETURNING id, email, name, role, is_active, profile_img`,
    [firebaseUid, email, decoded.name || 'User', decoded.picture || null]
  );

  return created.rows[0];
};

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const decodedFirebase = await verifyFirebaseToken(token);
      const user = await getOrCreateFirebaseUser(decodedFirebase);
      req.user = user;
      req.token = token;
      return next();
    } catch (firebaseError) {
      try {
        if (!process.env.JWT_SECRET) {
          return res.status(401).json({ error: 'Invalid authentication token' });
        }

        const decodedJwt = jwt.verify(token, process.env.JWT_SECRET);
        const result = await db.query(
          'SELECT id, email, name, role, is_active, profile_img FROM users WHERE id = $1',
          [decodedJwt.userId]
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
        return next();
      } catch (jwtError) {
        console.error('Token verification failed:', {
          firebaseError: firebaseError.message,
          jwtError: jwtError.message,
        });

        return res.status(401).json({
          error: 'Invalid authentication token',
          details: process.env.NODE_ENV === 'development' ? firebaseError.message : undefined,
        });
      }
    }
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    res.status(401).json({ error: 'Invalid authentication token or user missing' });
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
