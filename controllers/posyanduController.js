const db = require('../config/db');

// Get all posyandu
exports.getAll = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM posyandu ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error getAll posyandu:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get posyandu by ID
exports.getById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM posyandu WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Posyandu tidak ditemukan' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error getById posyandu:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create posyandu baru (Admin) - Cek Duplikat
exports.create = async (req, res) => {
  const { nama_posyandu, dusun } = req.body;
  if (!nama_posyandu || !nama_posyandu.trim()) {
    return res.status(400).json({ error: 'Nama Posyandu wajib diisi' });
  }
  try {
    const existing = await db.query('SELECT * FROM posyandu WHERE LOWER(nama_posyandu) = LOWER($1)', [nama_posyandu.trim()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: `Posyandu '${nama_posyandu.trim()}' sudah ada di database!` });
    }
    const result = await db.query(
      'INSERT INTO posyandu (nama_posyandu, dusun) VALUES ($1, $2) RETURNING *',
      [nama_posyandu.trim(), (dusun || 'Krajan').trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error create posyandu:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update posyandu (Admin)
exports.update = async (req, res) => {
  const { id } = req.params;
  const { nama_posyandu, dusun } = req.body;
  if (!nama_posyandu || !nama_posyandu.trim()) {
    return res.status(400).json({ error: 'Nama Posyandu wajib diisi' });
  }
  try {
    const existing = await db.query('SELECT * FROM posyandu WHERE LOWER(nama_posyandu) = LOWER($1) AND id != $2', [nama_posyandu.trim(), id]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: `Posyandu '${nama_posyandu.trim()}' sudah ada!` });
    }

    const result = await db.query(
      'UPDATE posyandu SET nama_posyandu = $1, dusun = $2 WHERE id = $3 RETURNING *',
      [nama_posyandu.trim(), (dusun || 'Krajan').trim(), id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Posyandu tidak ditemukan' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error update posyandu:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete posyandu (Admin)
exports.delete = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM posyandu WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Posyandu tidak ditemukan' });
    }
    res.json({ message: 'Posyandu berhasil dihapus', deleted: result.rows[0] });
  } catch (error) {
    console.error('Error delete posyandu:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
