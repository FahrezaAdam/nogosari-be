const db = require('../config/db');

// Get all kelompok rentan
exports.getAll = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM kelompok_rentan_banjir ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Create kelompok rentan baru (Admin)
exports.create = async (req, res) => {
  const { kategori_usia, jumlah_jiwa } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO kelompok_rentan_banjir (kategori_usia, jumlah_jiwa) VALUES ($1, $2) RETURNING *',
      [kategori_usia, jumlah_jiwa]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Update kelompok rentan (Admin)
exports.update = async (req, res) => {
  const { kategori_usia, jumlah_jiwa } = req.body;
  try {
    const result = await db.query(
      'UPDATE kelompok_rentan_banjir SET kategori_usia=$1, jumlah_jiwa=$2 WHERE id=$3 RETURNING *',
      [kategori_usia, jumlah_jiwa, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete kelompok rentan (Admin)
exports.delete = async (req, res) => {
  try {
    const result = await db.query('DELETE FROM kelompok_rentan_banjir WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
