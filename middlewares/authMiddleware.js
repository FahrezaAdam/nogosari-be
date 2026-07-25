const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Akses ditolak. Token tidak disediakan.' });
  }

  const token = authHeader.split(' ')[1]; // Format: "Bearer <token>"
  
  if (!token) {
    return res.status(401).json({ error: 'Akses ditolak. Format token salah.' });
  }

  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'rahasia_desa_nogosari_123';
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded; // Menyimpan data admin ke request
    next();
  } catch (error) {
    res.status(403).json({ error: 'Token tidak valid atau sudah kadaluarsa.' });
  }
};

module.exports = authMiddleware;
