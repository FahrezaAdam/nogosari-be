const db = require('../config/db');

// Helper untuk dapatkan id_dusun dari nama dusun atau ID
async function resolveDusunId(dusunInput) {
  if (typeof dusunInput === 'number' || !isNaN(Number(dusunInput))) {
    return Number(dusunInput);
  }
  if (!dusunInput) {
    const krajan = await db.query("SELECT id FROM dusun WHERE nama_dusun LIKE '%Krajan%'");
    return krajan.rows[0]?.id || 5;
  }
  const cleanName = String(dusunInput).trim();
  const keyword = cleanName.replace(/^Dusun\s+/i, '').trim();
  const res = await db.query(
    'SELECT id FROM dusun WHERE LOWER(nama_dusun) = LOWER($1) OR LOWER(nama_dusun) LIKE LOWER($2)',
    [cleanName, `%${keyword}%`]
  );
  if (res.rows.length > 0) return res.rows[0].id;
  return 5; // Default Krajan
}

// Get all posyandu (JOIN dengan tabel dusun)
exports.getAll = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        p.id, 
        p.nama_posyandu, 
        p.id_dusun,
        COALESCE(d.nama_dusun, 'Dusun Krajan') AS dusun
      FROM posyandu p
      LEFT JOIN dusun d ON p.id_dusun = d.id
      ORDER BY p.id ASC
    `);
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
    const result = await db.query(`
      SELECT 
        p.id, 
        p.nama_posyandu, 
        p.id_dusun,
        COALESCE(d.nama_dusun, 'Dusun Krajan') AS dusun
      FROM posyandu p
      LEFT JOIN dusun d ON p.id_dusun = d.id
      WHERE p.id = $1
    `, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Posyandu tidak ditemukan' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error getById posyandu:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create posyandu baru (Admin)
exports.create = async (req, res) => {
  const { nama_posyandu, dusun, id_dusun } = req.body;
  if (!nama_posyandu || !nama_posyandu.trim()) {
    return res.status(400).json({ error: 'Nama Posyandu wajib diisi' });
  }
  try {
    const existing = await db.query('SELECT * FROM posyandu WHERE LOWER(nama_posyandu) = LOWER($1)', [nama_posyandu.trim()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: `Posyandu '${nama_posyandu.trim()}' sudah ada di database!` });
    }

    const targetDusunId = await resolveDusunId(id_dusun || dusun);
    const result = await db.query(
      'INSERT INTO posyandu (nama_posyandu, id_dusun) VALUES ($1, $2) RETURNING *',
      [nama_posyandu.trim(), targetDusunId]
    );

    const fetched = await db.query(`
      SELECT p.id, p.nama_posyandu, p.id_dusun, d.nama_dusun AS dusun
      FROM posyandu p LEFT JOIN dusun d ON p.id_dusun = d.id WHERE p.id = $1
    `, [result.rows[0].id]);

    res.status(201).json(fetched.rows[0]);
  } catch (error) {
    console.error('Error create posyandu:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update posyandu (Admin)
exports.update = async (req, res) => {
  const { id } = req.params;
  const { nama_posyandu, dusun, id_dusun } = req.body;
  if (!nama_posyandu || !nama_posyandu.trim()) {
    return res.status(400).json({ error: 'Nama Posyandu wajib diisi' });
  }
  try {
    const existing = await db.query('SELECT * FROM posyandu WHERE LOWER(nama_posyandu) = LOWER($1) AND id != $2', [nama_posyandu.trim(), id]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: `Posyandu '${nama_posyandu.trim()}' sudah ada!` });
    }

    const targetDusunId = await resolveDusunId(id_dusun || dusun);
    const result = await db.query(
      'UPDATE posyandu SET nama_posyandu = $1, id_dusun = $2 WHERE id = $3 RETURNING *',
      [nama_posyandu.trim(), targetDusunId, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Posyandu tidak ditemukan' });
    }

    const fetched = await db.query(`
      SELECT p.id, p.nama_posyandu, p.id_dusun, d.nama_dusun AS dusun
      FROM posyandu p LEFT JOIN dusun d ON p.id_dusun = d.id WHERE p.id = $1
    `, [id]);

    res.json(fetched.rows[0]);
  } catch (error) {
    console.error('Error update posyandu:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete posyandu (Admin)
exports.delete = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM kelompok_rentan_banjir WHERE id_posyandu = $1', [id]);
    const result = await db.query('DELETE FROM posyandu WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Posyandu tidak ditemukan' });
    }
    res.json({ message: 'Posyandu dan data kelompok rentan berhasil dihapus', deleted: result.rows[0] });
  } catch (error) {
    console.error('Error delete posyandu:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
