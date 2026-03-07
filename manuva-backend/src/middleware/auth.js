const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { verifyFirebaseToken } = require('../config/firebaseAdmin');

const getOrCreateFirebaseUser = async (decoded) => {
  const firebaseUid = decoded.uid;
  const email = decoded.email;
  
  console.log('--- getOrCreateFirebaseUser Trace ---');
  console.log('UID:', firebaseUid);
  console.log('Email:', email);

  if (!email) {
    throw new Error('Firebase token is missing email claim');
  }

  // Helper to find existing user by UID or Email
  const findUser = async () => {
    const result = await db.query(
      `SELECT id, email, name, role, is_active, profile_img
       FROM users
       WHERE firebase_uid = $1 OR email = $2
       LIMIT 1`,
      [firebaseUid, email]
    );
    return result.rows[0];
  };

  const existing = await findUser();

  if (existing) {
    if (!existing.is_active) {
      throw new Error('Account is deactivated');
    }

    // Update if needed
    await db.query(
      `UPDATE users
       SET firebase_uid = COALESCE(firebase_uid, $1),
           name = COALESCE($2, name),
           profile_img = COALESCE($3, profile_img)
       WHERE id = $4`,
      [firebaseUid, decoded.name || null, decoded.picture || null, existing.id]
    );

    return existing;
  }

  try {
    const created = await db.query(
      `INSERT INTO users (firebase_uid, email, name, role, profile_img, password)
       VALUES ($1, $2, $3, 'customer', $4, 'firebase_managed')
       RETURNING id, email, name, role, is_active, profile_img`,
      [firebaseUid, email, decoded.name || 'User', decoded.picture || null]
    );
    return created.rows[0];
  } catch (err) {
    // Handle race condition: If another request created the user concurrently
    if (err.code === '23505') {
      const retryUser = await findUser();
      if (retryUser) return retryUser;
    }
    throw err;
  }
};

const verifyUserToken = async (token) => {
  try {
    const decodedFirebase = await verifyFirebaseToken(token);
    const user = await getOrCreateFirebaseUser(decodedFirebase);
    return user;
  } catch (firebaseError) {
    console.warn('Firebase verification failed, trying JWT:', firebaseError.message);
    try {
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET not configured');
      }

      const decodedJwt = jwt.verify(token, process.env.JWT_SECRET);
      const result = await db.query(
        'SELECT id, email, name, role, is_active, profile_img FROM users WHERE id = $1',
        [decodedJwt.userId]
      );

      if (result.rows.length === 0) {
        throw new Error('User not found in database');
      }

      const user = result.rows[0];
      if (!user.is_active) {
        throw new Error('Account is deactivated');
      }

      return user;
    } catch (jwtError) {
      const err = new Error('Session expired or invalid. Please sign in again.');
      err.details = {
        firebase: firebaseError.message,
        jwt: jwtError.message
      };
      throw err;
    }
  }
};

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const user = await verifyUserToken(token);
      req.user = user;
      req.token = token;
      return next();
    } catch (err) {
      console.error('Total Auth Failure:', err.details || err.message);

      return res.status(401).json({
        error: err.message,
        details: process.env.NODE_ENV === 'development' ? err.details : undefined,
      });
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

module.exports = { auth, isArtisan, isAdmin, verifyUserToken };
