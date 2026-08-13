const db = require('../config/db');

// Get all dusun
exports.getAll = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM dusun ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error getAll dusun:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get dusun by ID
exports.getById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM dusun WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dusun tidak ditemukan' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error getById dusun:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create dusun baru (Admin)
exports.create = async (req, res) => {
  const { nama_dusun } = req.body;
  if (!nama_dusun || !nama_dusun.trim()) {
    return res.status(400).json({ error: 'Nama dusun wajib diisi' });
  }
  try {
    const existing = await db.query('SELECT * FROM dusun WHERE LOWER(nama_dusun) = LOWER($1)', [nama_dusun.trim()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: `Dusun '${nama_dusun.trim()}' sudah ada di database!` });
    }
    const result = await db.query(
      'INSERT INTO dusun (nama_dusun) VALUES ($1) RETURNING *',
      [nama_dusun.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error create dusun:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update dusun (Admin)
exports.update = async (req, res) => {
  const { id } = req.params;
  const { nama_dusun } = req.body;
  if (!nama_dusun || !nama_dusun.trim()) {
    return res.status(400).json({ error: 'Nama dusun wajib diisi' });
  }
  try {
    const result = await db.query(
      'UPDATE dusun SET nama_dusun = $1 WHERE id = $2 RETURNING *',
      [nama_dusun.trim(), id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dusun tidak ditemukan' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error update dusun:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete dusun (Admin)
exports.delete = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM dusun WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dusun tidak ditemukan' });
    }
    res.json({ message: 'Dusun berhasil dihapus', deleted: result.rows[0] });
  } catch (error) {
    console.error('Error delete dusun:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
