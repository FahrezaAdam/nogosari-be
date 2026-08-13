const db = require('../config/db');

// Helper untuk cari id_dusun dari nama dusun atau ID
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
  return 5;
}

// Get all kelompok rentan (dengan nama posyandu & nama kategori & dusun dari JOIN)
exports.getAll = async (req, res) => {
  try {
    const queryText = `
      SELECT 
        krb.id,
        krb.id AS id_rentan,
        p.id AS id_posyandu,
        p.nama_posyandu,
        p.id_dusun,
        COALESCE(d.nama_dusun, 'Dusun Krajan') AS dusun,
        kr.id AS id_kategori,
        kr.nama_kategori,
        krb.jumlah_jiwa
      FROM kelompok_rentan_banjir krb
      JOIN posyandu p ON krb.id_posyandu = p.id
      LEFT JOIN dusun d ON p.id_dusun = d.id
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

// Get list posyandu (JOIN tabel dusun)
exports.getPosyanduList = async (req, res) => {
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
    console.error('Error getPosyanduList:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create posyandu baru (Admin) - Cek Duplikat
exports.createPosyandu = async (req, res) => {
  const { nama_posyandu, dusun, id_dusun } = req.body;
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
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error create posyandu:', error);
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
      SELECT p.id, p.nama_posyandu, COALESCE(d.nama_dusun, 'Dusun Krajan') AS dusun, COALESCE(SUM(krb.jumlah_jiwa), 0) AS total_jiwa
      FROM posyandu p
      LEFT JOIN dusun d ON p.id_dusun = d.id
      LEFT JOIN kelompok_rentan_banjir krb ON p.id = krb.id_posyandu
      GROUP BY p.id, p.nama_posyandu, d.nama_dusun
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

// Save Batch Kelompok Rentan & Update Posyandu (Admin)
exports.saveBatch = async (req, res) => {
  let { id_posyandu, nama_posyandu, dusun, id_dusun, categories } = req.body;
  try {
    const targetDusunId = await resolveDusunId(id_dusun || dusun);

    if (!id_posyandu && nama_posyandu) {
      // Buat posyandu baru
      const existing = await db.query('SELECT id FROM posyandu WHERE LOWER(nama_posyandu) = LOWER($1)', [nama_posyandu.trim()]);
      if (existing.rows.length > 0) {
        return res.status(400).json({ error: `Posyandu '${nama_posyandu.trim()}' sudah ada di database!` });
      }

      const posRes = await db.query(
        'INSERT INTO posyandu (nama_posyandu, id_dusun) VALUES ($1, $2) RETURNING id',
        [nama_posyandu.trim(), targetDusunId]
      );
      id_posyandu = posRes.rows[0].id;
    } else if (id_posyandu && nama_posyandu) {
      // Edit nama posyandu dan id_dusun jika ada
      const existing = await db.query('SELECT id FROM posyandu WHERE LOWER(nama_posyandu) = LOWER($1) AND id != $2', [nama_posyandu.trim(), id_posyandu]);
      if (existing.rows.length > 0) {
        return res.status(400).json({ error: `Nama Posyandu '${nama_posyandu.trim()}' sudah digunakan oleh Posyandu lain!` });
      }
      await db.query(
        'UPDATE posyandu SET nama_posyandu = $1, id_dusun = $2 WHERE id = $3',
        [nama_posyandu.trim(), targetDusunId, id_posyandu]
      );
    }

    if (!id_posyandu) {
      return res.status(400).json({ error: 'id_posyandu atau nama_posyandu wajib diisi' });
    }

    const results = [];
    const catEntries = Array.isArray(categories) 
      ? categories 
      : Object.entries(categories || {}).map(([id_kategori, jumlah_jiwa]) => ({ id_kategori: Number(id_kategori), jumlah_jiwa: Number(jumlah_jiwa) }));

    for (const cat of catEntries) {
      const checkRes = await db.query(
        'SELECT id FROM kelompok_rentan_banjir WHERE id_posyandu = $1 AND id_kategori = $2',
        [id_posyandu, cat.id_kategori]
      );

      if (checkRes.rows.length > 0) {
        const updateRes = await db.query(
          'UPDATE kelompok_rentan_banjir SET jumlah_jiwa = $1 WHERE id = $2 RETURNING *',
          [cat.jumlah_jiwa, checkRes.rows[0].id]
        );
        results.push(updateRes.rows[0]);
      } else {
        const insertRes = await db.query(
          'INSERT INTO kelompok_rentan_banjir (id_posyandu, id_kategori, jumlah_jiwa) VALUES ($1, $2, $3) RETURNING *',
          [id_posyandu, cat.id_kategori, cat.jumlah_jiwa]
        );
        results.push(insertRes.rows[0]);
      }
    }

    res.status(200).json({ message: 'Batch save successful', id_posyandu, rows: results });
  } catch (error) {
    console.error('Error saveBatch rentan banjir:', error);
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
