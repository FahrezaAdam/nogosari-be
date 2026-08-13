const db = require('../config/db');

// Helper untuk cari id_dusun dari nama dusun
async function resolveDusun(dusunName) {
  if (!dusunName) {
    const krajan = await db.query("SELECT * FROM dusun WHERE nama_dusun LIKE '%Krajan%'");
    return krajan.rows[0] || { id: 5, nama_dusun: 'Dusun Krajan' };
  }
  const cleanName = dusunName.trim();
  const keyword = cleanName.replace(/^Dusun\s+/i, '').trim();
  const res = await db.query(
    'SELECT * FROM dusun WHERE LOWER(nama_dusun) = LOWER($1) OR LOWER(nama_dusun) LIKE LOWER($2)',
    [cleanName, `%${keyword}%`]
  );
  if (res.rows.length > 0) return res.rows[0];
  return { id: 5, nama_dusun: cleanName };
}

// Get all posyandu (Join dengan tabel dusun)
exports.getAll = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        p.id, 
        p.nama_posyandu, 
        COALESCE(d.nama_dusun, p.dusun) AS dusun, 
        COALESCE(p.id_dusun, d.id) AS id_dusun
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
        COALESCE(d.nama_dusun, p.dusun) AS dusun, 
        COALESCE(p.id_dusun, d.id) AS id_dusun
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
  const { nama_posyandu, dusun } = req.body;
  if (!nama_posyandu || !nama_posyandu.trim()) {
    return res.status(400).json({ error: 'Nama Posyandu wajib diisi' });
  }
  try {
    const existing = await db.query('SELECT * FROM posyandu WHERE LOWER(nama_posyandu) = LOWER($1)', [nama_posyandu.trim()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: `Posyandu '${nama_posyandu.trim()}' sudah ada di database!` });
    }

    const dusunObj = await resolveDusun(dusun);
    const result = await db.query(
      'INSERT INTO posyandu (nama_posyandu, dusun, id_dusun) VALUES ($1, $2, $3) RETURNING *',
      [nama_posyandu.trim(), dusunObj.nama_dusun, dusunObj.id]
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

    const dusunObj = await resolveDusun(dusun);
    const result = await db.query(
      'UPDATE posyandu SET nama_posyandu = $1, dusun = $2, id_dusun = $3 WHERE id = $4 RETURNING *',
      [nama_posyandu.trim(), dusunObj.nama_dusun, dusunObj.id, id]
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
