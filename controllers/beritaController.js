const db = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM berita ORDER BY tanggal_publikasi DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM berita WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.create = async (req, res) => {
  const { judul, isi, gambar, kategori } = req.body;
  const penulis_id = req.admin.id; // didapat dari authMiddleware
  try {
    const result = await db.query(
      'INSERT INTO berita (judul, isi, gambar, kategori, penulis_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [judul, isi, gambar, kategori, penulis_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.update = async (req, res) => {
  const { judul, isi, gambar, kategori } = req.body;
  try {
    const result = await db.query(
      'UPDATE berita SET judul=$1, isi=$2, gambar=$3, kategori=$4 WHERE id=$5 RETURNING *',
      [judul, isi, gambar, kategori, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.delete = async (req, res) => {
  try {
    const result = await db.query('DELETE FROM berita WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
