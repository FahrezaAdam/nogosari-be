const db = require('../config/db');

// Get all kelompok rentan (dengan nama posyandu & nama kategori)
exports.getAll = async (req, res) => {
  try {
    const queryText = `
      SELECT 
        krb.id,
        krb.id AS id_rentan,
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

// Get list posyandu
exports.getPosyanduList = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM posyandu ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error getPosyanduList:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get list kategori rentan
exports.getKategoriList = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM kategori_rentan ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error getKategoriList:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get summary ringkasan statistik
exports.getSummary = async (req, res) => {
  try {
    const totalResult = await db.query('SELECT COALESCE(SUM(jumlah_jiwa), 0) AS total_jiwa, COUNT(*) AS total_records FROM kelompok_rentan_banjir');
    const kategoriResult = await db.query(`
      SELECT kr.id, kr.nama_kategori, COALESCE(SUM(krb.jumlah_jiwa), 0) AS total_jiwa
      FROM kategori_rentan kr
      LEFT JOIN kelompok_rentan_banjir krb ON kr.id = krb.id_kategori
      GROUP BY kr.id, kr.nama_kategori
      ORDER BY kr.id ASC
    `);
    const posyanduResult = await db.query(`
      SELECT p.id, p.nama_posyandu, p.dusun, COALESCE(SUM(krb.jumlah_jiwa), 0) AS total_jiwa
      FROM posyandu p
      LEFT JOIN kelompok_rentan_banjir krb ON p.id = krb.id_posyandu
      GROUP BY p.id, p.nama_posyandu, p.dusun
      ORDER BY p.id ASC
    `);
    res.json({
      total_jiwa: Number(totalResult.rows[0].total_jiwa),
      total_records: Number(totalResult.rows[0].total_records),
      by_kategori: kategoriResult.rows.map(r => ({ ...r, total_jiwa: Number(r.total_jiwa) })),
      by_posyandu: posyanduResult.rows.map(r => ({ ...r, total_jiwa: Number(r.total_jiwa) })),
    });
  } catch (error) {
    console.error('Error getSummary rentan banjir:', error);
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
