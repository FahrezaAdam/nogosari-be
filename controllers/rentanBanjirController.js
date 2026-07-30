const db = require('../config/db');

// Get all kelompok rentan (dengan nama posyandu & nama kategori)
exports.getAll = async (req, res) => {
  try {
    const queryText = `
      SELECT 
        krb.id,
        p.id AS id_posyandu,
        p.nama_posyandu,
        p.dusun,
        kr.id AS id_kategori,
        kr.nama_kategori,
        krb.jumlah_jiwa
      FROM kelompok_rentan_banjir krb
      JOIN posyandu p ON krb.id_posyandu = p.id
      JOIN kategori_rentan kr ON krb.id_kategori = kr.id
      ORDER BY p.id ASC, kr.id ASC
    `;
    const result = await db.query(queryText);
    res.json(result.rows);
  } catch (error) {
    console.error('Error getAll rentan banjir:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create kelompok rentan baru (Admin)
exports.create = async (req, res) => {
  const { id_posyandu, id_kategori, jumlah_jiwa } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO kelompok_rentan_banjir (id_posyandu, id_kategori, jumlah_jiwa) VALUES ($1, $2, $3) RETURNING *',
      [id_posyandu, id_kategori, jumlah_jiwa]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error create rentan banjir:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update kelompok rentan (Admin)
exports.update = async (req, res) => {
  const { id_posyandu, id_kategori, jumlah_jiwa } = req.body;
  try {
    const result = await db.query(
      'UPDATE kelompok_rentan_banjir SET id_posyandu=$1, id_kategori=$2, jumlah_jiwa=$3 WHERE id=$4 RETURNING *',
      [id_posyandu, id_kategori, jumlah_jiwa, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error update rentan banjir:', error);
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
