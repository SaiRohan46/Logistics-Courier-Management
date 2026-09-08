import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'logipulse_super_secret_jwt_key_2026';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Authentication token required.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired authentication token.' });
  }
};

export const requireAdminOrDispatcher = (req, res, next) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'dispatcher')) {
    return res.status(403).json({ error: 'Access restricted to Dispatchers and Admins.' });
  }
  next();
};
